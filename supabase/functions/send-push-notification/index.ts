import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EventType = 'venda' | 'agendamento' | 'novo_cliente' | 'producao'

const prefColumnMap: Record<EventType, string> = {
  venda: 'notify_venda',
  agendamento: 'notify_agendamento',
  novo_cliente: 'notify_novo_cliente',
  producao: 'notify_producao',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event_type, tenant_id, payload } = await req.json() as {
      event_type: EventType
      tenant_id: string
      payload: { title: string; body: string; url?: string; tag?: string }
    }

    if (!event_type || !tenant_id || !payload) {
      return new Response(JSON.stringify({ error: 'event_type, tenant_id e payload são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prefColumn = prefColumnMap[event_type]
    if (!prefColumn) {
      return new Response(JSON.stringify({ error: `event_type inválido: ${event_type}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@seumelhorfuncionario.com'

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    // Busca subscribers ativos do tenant que querem esse tipo de notificação
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, user_id')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)

    if (subError) throw subError
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'Nenhum subscriber ativo' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Filtra pelos que têm a preferência ativa
    const userIds = subscriptions.map((s) => s.user_id)
    const { data: prefs } = await supabase
      .from('push_notification_prefs')
      .select(`user_id, ${prefColumn}`)
      .in('user_id', userIds)
      .eq(prefColumn, true)

    const allowedUserIds = new Set((prefs ?? []).map((p) => p.user_id))

    // Usuários sem row em push_notification_prefs recebem tudo por padrão
    const eligible = subscriptions.filter(
      (s) => allowedUserIds.has(s.user_id) || !(prefs ?? []).find((p) => p.user_id === s.user_id)
    )

    if (eligible.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'Nenhum subscriber quer esse tipo de notificação' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? '/',
      tag: payload.tag ?? event_type,
    })

    const expiredIds: string[] = []
    let sent = 0

    await Promise.allSettled(
      eligible.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            pushPayload,
          )
          sent++
        } catch (err: any) {
          // 410 Gone ou 404 = subscription expirada
          if (err.statusCode === 410 || err.statusCode === 404) {
            expiredIds.push(sub.id)
          } else {
            console.error(`Erro ao enviar push para ${sub.id}:`, err.message)
          }
        }
      })
    )

    // Marca subscriptions expiradas como inativas
    if (expiredIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .in('id', expiredIds)
    }

    return new Response(JSON.stringify({ sent, expired: expiredIds.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('send-push-notification error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
