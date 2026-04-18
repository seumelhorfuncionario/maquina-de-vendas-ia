import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const AGENTS_URL = 'https://wacotfqoarsbazrreeco.supabase.co'
const AGENTS_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY290ZnFvYXJzYmF6cnJlZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2NDU3NSwiZXhwIjoyMDg4OTQwNTc1fQ.F6zZ7f4XAP4jrhuKUHDajW4cnYGHncSoDuGDLavRZ2g'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    const anon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData, error: userErr } = await anon.auth.getUser()
    if (userErr || !userData.user) return json({ error: 'Invalid session' }, 401)
    const userId = userData.user.id
    const userEmail = userData.user.email ?? ''

    const smf = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const queryClientId = url.searchParams.get('client_id')
    const days = Math.max(1, Math.min(365, parseInt(url.searchParams.get('days') ?? '30', 10)))

    const { data: superAdminRow } = await smf
      .from('super_admins')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()
    const isSuperAdmin = !!superAdminRow

    let clientRow: { id: string; agent_whatsapp_id: number | null; agent_instagram_id: number | null } | null = null

    if (isSuperAdmin && queryClientId) {
      const { data: c } = await smf
        .from('clients')
        .select('id, agent_whatsapp_id, agent_instagram_id')
        .eq('id', queryClientId)
        .maybeSingle()
      clientRow = c
    } else {
      const { data: c } = await smf
        .from('clients')
        .select('id, agent_whatsapp_id, agent_instagram_id')
        .eq('auth_user_id', userId)
        .eq('is_active', true)
        .maybeSingle()
      clientRow = c
    }

    if (!clientRow) return json({ error: 'Client not found' }, 403)

    const agentIds = [clientRow.agent_whatsapp_id, clientRow.agent_instagram_id]
      .filter((v): v is number => typeof v === 'number')

    if (agentIds.length === 0) {
      return json({ total: 0, active: 0, finalized: 0, by_day: [] })
    }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const agentsDb = createClient(AGENTS_URL, AGENTS_SERVICE_KEY)
    const { data: transfers, error: tErr } = await agentsDb
      .from('atendimento_humano')
      .select('id, criado_em, finalizado')
      .in('agente_id', agentIds)
      .gte('criado_em', since)
      .order('criado_em', { ascending: false })
      .limit(1000)

    if (tErr) return json({ error: tErr.message }, 500)

    const rows = transfers ?? []
    const total = rows.length
    const finalized = rows.filter((r) => r.finalizado === true).length
    const active = total - finalized

    // Group by day (YYYY-MM-DD) for sparkline
    const byDayMap = new Map<string, number>()
    for (const r of rows) {
      if (!r.criado_em) continue
      const day = new Date(r.criado_em).toISOString().slice(0, 10)
      byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1)
    }
    const by_day = Array.from(byDayMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day))

    return json({ total, active, finalized, by_day, days })
  } catch (err) {
    console.error('client-transfers error:', err)
    return json({ error: 'Internal server error', detail: (err as Error).message }, 500)
  }
})
