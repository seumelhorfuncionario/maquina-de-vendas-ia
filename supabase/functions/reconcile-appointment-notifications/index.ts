import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-reconcile-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Reconciles appointment group notifications that the `agendar_reuniao` tool
// may have silently skipped (retries, UazAPI timeouts, etc).
// Deploy on Agent System. Trigger via Supabase Cron every 5 minutes.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  // Shared-secret auth — cron passes x-reconcile-key header
  const expectedKey = Deno.env.get('RECONCILE_API_KEY')
  const providedKey = req.headers.get('x-reconcile-key')
  if (expectedKey && providedKey !== expectedKey) {
    return json({ error: 'Invalid reconcile key' }, 401)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const url = new URL(req.url)
  const windowMinutes = Math.max(5, Math.min(1440, parseInt(url.searchParams.get('window_minutes') ?? '60', 10)))
  const maxAttempts = Math.max(1, Math.min(10, parseInt(url.searchParams.get('max_attempts') ?? '3', 10)))
  const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get('limit') ?? '50', 10)))

  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString()

  const { data: pending, error } = await supabase
    .from('agendamentos')
    .select('id, agente_id, nome_cliente, procedimento, data_inicio, notificado_grupo_tentativas')
    .is('notificado_grupo_em', null)
    .gte('criado_em', since)
    .lt('notificado_grupo_tentativas', maxAttempts)
    .order('criado_em', { ascending: true })
    .limit(limit)

  if (error) return json({ error: error.message }, 500)

  let sent = 0
  let failed = 0
  const errors: Array<{ id: number; error: string }> = []

  for (const row of pending ?? []) {
    const { data: config } = await supabase
      .from('notificacao_config')
      .select('grupo_whatsapp_jid, uazapi_notificacao_url, uazapi_notificacao_token')
      .eq('agente_id', row.agente_id)
      .maybeSingle()

    const nextAttempts = (row.notificado_grupo_tentativas ?? 0) + 1

    if (!config?.grupo_whatsapp_jid || !config?.uazapi_notificacao_url || !config?.uazapi_notificacao_token) {
      await supabase
        .from('agendamentos')
        .update({
          notificado_grupo_erro: 'Missing notificacao_config for this agente',
          notificado_grupo_tentativas: nextAttempts,
        })
        .eq('id', row.id)
      failed++
      errors.push({ id: row.id, error: 'missing_config' })
      continue
    }

    const when = row.data_inicio
      ? new Date(row.data_inicio).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : 'data não informada'
    const text = `🗓️ *Novo agendamento*\n\n👤 Cliente: ${row.nome_cliente ?? '—'}\n💼 Procedimento: ${row.procedimento ?? '—'}\n📅 Quando: ${when}`

    try {
      const baseUrl = config.uazapi_notificacao_url.replace(/\/$/, '')
      const res = await fetch(`${baseUrl}/send/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: config.uazapi_notificacao_token,
        },
        body: JSON.stringify({ number: config.grupo_whatsapp_jid, text }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`UazAPI HTTP ${res.status}: ${body.slice(0, 200)}`)
      }

      await supabase
        .from('agendamentos')
        .update({
          notificado_grupo_em: new Date().toISOString(),
          notificado_grupo_erro: null,
          notificado_grupo_tentativas: nextAttempts,
        })
        .eq('id', row.id)
      sent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown'
      await supabase
        .from('agendamentos')
        .update({
          notificado_grupo_erro: msg,
          notificado_grupo_tentativas: nextAttempts,
        })
        .eq('id', row.id)
      failed++
      errors.push({ id: row.id, error: msg })
    }
  }

  return json({ processed: pending?.length ?? 0, sent, failed, errors, window_minutes: windowMinutes })
})
