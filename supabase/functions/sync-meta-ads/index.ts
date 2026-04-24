// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GRAPH = 'https://graph.facebook.com/v21.0'
const LOOKBACK_DAYS = 90

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// Soma valor do primeiro action_type que bate num dos prefixos/matches fornecidos.
// Meta devolve arrays de { action_type, value } — usamos match por inclusao pra cobrir variacoes
// (ex: offsite_conversion.fb_pixel_purchase cobre "purchase").
function sumActions(arr: any[] | undefined, matchers: string[]): number {
  if (!Array.isArray(arr)) return 0
  let total = 0
  for (const a of arr) {
    const t = String(a.action_type || '')
    if (matchers.some(m => t === m || t.includes(m))) {
      total += Number(a.value || 0)
    }
  }
  return total
}

async function fetchAllPages(url: string): Promise<any[]> {
  const out: any[] = []
  let next: string | null = url
  while (next) {
    const res = await fetch(next)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Graph API ${res.status}: ${text.slice(0, 500)}`)
    }
    const body = await res.json()
    if (Array.isArray(body.data)) out.push(...body.data)
    next = body.paging?.next ?? null
  }
  return out
}

type CampaignMeta = { name: string; objective: string; status: string }

async function syncClient(
  admin: any,
  token: string,
  client: { id: string; business_name: string; meta_ads_account_id: string },
  since: string,
  until: string,
) {
  const acct = client.meta_ads_account_id
  // 1) Metadata de campanhas (nome, objetivo, status)
  const campUrl = `${GRAPH}/${acct}/campaigns?fields=id,name,objective,effective_status&limit=100&access_token=${encodeURIComponent(token)}`
  const camps = await fetchAllPages(campUrl)
  const metaMap = new Map<string, CampaignMeta>()
  for (const c of camps) {
    metaMap.set(String(c.id), {
      name: String(c.name || ''),
      objective: String(c.objective || 'UNKNOWN'),
      status: String(c.effective_status || 'UNKNOWN'),
    })
  }

  // 2) Insights diarios por campanha
  const timeRange = encodeURIComponent(JSON.stringify({ since, until }))
  const fields = 'campaign_id,spend,impressions,clicks,actions,action_values,cpm,cpc,ctr,date_start'
  const insUrl = `${GRAPH}/${acct}/insights?level=campaign&fields=${fields}&time_increment=1&time_range=${timeRange}&limit=500&access_token=${encodeURIComponent(token)}`
  const rows = await fetchAllPages(insUrl)

  // 3) Normaliza pra schema de `campaigns`
  const upserts = rows.map((r: any) => {
    const campaignId = String(r.campaign_id)
    const meta = metaMap.get(campaignId) || { name: '', objective: 'UNKNOWN', status: 'UNKNOWN' }
    const spend = Number(r.spend || 0)
    const impressions = Number(r.impressions || 0)
    const clicks = Number(r.clicks || 0)
    const actions = r.actions as any[] | undefined
    const actionValues = r.action_values as any[] | undefined

    const leads = sumActions(actions, ['lead', 'onsite_conversion.lead_grouped'])
    const purchases = sumActions(actions, ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase'])
    const link_clicks = sumActions(actions, ['link_click'])
    const video_views = sumActions(actions, ['video_view'])
    const engagement = sumActions(actions, ['post_engagement'])
    const messaging_replies = sumActions(actions, ['onsite_conversion.messaging_conversation_started_7d', 'onsite_conversion.messaging_reply'])
    const revenue = sumActions(actionValues, ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase'])

    const roas = spend > 0 ? revenue / spend : 0
    const cost_per_result = leads > 0 ? spend / leads : (purchases > 0 ? spend / purchases : 0)

    return {
      client_id: client.id,
      campaign_id: campaignId,
      campaign_name: meta.name,
      objective: meta.objective,
      status: meta.status,
      spend,
      revenue,
      purchases: Math.round(purchases),
      impressions: Math.round(impressions),
      clicks: Math.round(clicks),
      leads: Math.round(leads),
      cpm: Number(r.cpm || 0),
      cpc: Number(r.cpc || 0),
      ctr: Number(r.ctr || 0),
      roas,
      link_clicks: Math.round(link_clicks),
      video_views: Math.round(video_views),
      engagement: Math.round(engagement),
      messaging_replies: Math.round(messaging_replies),
      cost_per_result,
      date: String(r.date_start),
      updated_at: new Date().toISOString(),
    }
  })

  if (upserts.length === 0) {
    return { client_id: client.id, business_name: client.business_name, campaigns: metaMap.size, rows_written: 0, range: { since, until } }
  }

  // 4) UPSERT em batches de 500
  const BATCH = 500
  let written = 0
  for (let i = 0; i < upserts.length; i += BATCH) {
    const chunk = upserts.slice(i, i + BATCH)
    const { error } = await admin
      .from('campaigns')
      .upsert(chunk, { onConflict: 'client_id,campaign_id,date' })
    if (error) throw new Error(`Upsert falhou no chunk ${i}: ${error.message}`)
    written += chunk.length
  }

  return {
    client_id: client.id,
    business_name: client.business_name,
    campaigns: metaMap.size,
    rows_written: written,
    range: { since, until },
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const token = Deno.env.get('META_ACCESS_TOKEN')
    if (!token) return json(500, { error: 'META_ACCESS_TOKEN nao configurado nos secrets do Supabase' })

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json().catch(() => ({}))
    const specificClientId: string | undefined = body.client_id
    const lookback: number = Number(body.lookback_days || LOOKBACK_DAYS)

    const until = ymd(new Date())
    const since = ymd(new Date(Date.now() - lookback * 86400000))

    // Seleciona clientes com ad account configurado
    let query = admin
      .from('clients')
      .select('id, business_name, meta_ads_account_id')
      .not('meta_ads_account_id', 'is', null)
      .neq('meta_ads_account_id', '')
    if (specificClientId) query = query.eq('id', specificClientId)

    const { data: clients, error: qErr } = await query
    if (qErr) return json(500, { error: `Falha ao listar clientes: ${qErr.message}` })
    if (!clients || clients.length === 0) {
      return json(200, { synced: 0, results: [], message: 'Nenhum cliente com meta_ads_account_id' })
    }

    const results: any[] = []
    const errors: any[] = []
    for (const c of clients) {
      try {
        const r = await syncClient(admin, token, c as any, since, until)
        results.push(r)
      } catch (e) {
        errors.push({ client_id: c.id, business_name: c.business_name, error: String((e as Error).message || e) })
      }
    }

    return json(200, {
      synced: results.length,
      failed: errors.length,
      range: { since, until, lookback_days: lookback },
      results,
      errors: errors.length ? errors : undefined,
    })
  } catch (e) {
    return json(500, { error: String((e as Error).message || e) })
  }
})
