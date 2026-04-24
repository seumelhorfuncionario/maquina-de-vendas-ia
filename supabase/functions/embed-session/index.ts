import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Origens confiaveis podem pular a validacao do embed_token (auto-login por client_id).
// Browser-enforced: Origin header so pode ser setado pelo browser em fetch cross-origin;
// atacantes nao-browser podem falsificar, mas o token_hash resultante so autentica o
// auth_user_id do cliente especifico -- RLS cuida do resto. Trust assumption: SMF
// controla esses dominios; XSS em qualquer um deles seria um incidente de seguranca proprio.
const TRUSTED_ORIGINS = new Set([
  'https://crm.seumelhorfuncionario.com',
  'https://resultados.seumelhorfuncionario.com',
  'https://painel.seumelhorfuncionario.com',
  'https://motor.seumelhorfuncionario.com',
  'https://gestao.seumelhorfuncionario.com',
])

const json = (data: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...extraHeaders, 'Content-Type': 'application/json' },
  })

function corsHeadersFor(origin: string | null): Record<string, string> {
  // Reflete Origin se confiavel, senao '*' mantendo retro-compat com callers antigos
  // que passavam embed_token explicitamente.
  const allowOrigin = origin && TRUSTED_ORIGINS.has(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const cors = corsHeadersFor(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, cors)
  }

  try {
    const body = await req.json()
    const client_id = body?.client_id as string | undefined
    const token = body?.token as string | undefined
    const parent_origin = body?.parent_origin as string | undefined

    if (!client_id) {
      return json({ error: 'client_id is required' }, 400, cors)
    }

    // Autenticacao sem token exige:
    //   (a) CORS Origin da request = dominio SMF (origem do iframe, nao do pai)
    //   (b) parent_origin enviado pelo client (document.referrer) tambem trusted
    // Uma sem a outra nao basta: (a) sozinho permite qualquer site trusted embedar
    // qualquer outro iframe; (b) sozinho pode ser spoofado em request nao-browser.
    // Combinando, so passa se o client rodando em iframe dentro de dominio SMF
    // confirma que o pai tambem e trusted.
    const isTrustedOrigin = !!origin && TRUSTED_ORIGINS.has(origin)
    const isTrustedParent = !!parent_origin && TRUSTED_ORIGINS.has(parent_origin)

    if (!token && !(isTrustedOrigin && isTrustedParent)) {
      return json({ error: 'token is required, or request must come from a trusted embed context' }, 400, cors)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: client, error: clientErr } = await admin
      .from('clients')
      .select('id, auth_user_id, embed_token, is_active')
      .eq('id', client_id)
      .maybeSingle()

    if (clientErr || !client) return json({ error: 'Client not found' }, 404, cors)
    if (!client.is_active) return json({ error: 'Client inactive' }, 403, cors)
    if (!client.auth_user_id) return json({ error: 'Client has no auth user bound' }, 400, cors)

    // Se veio token, valida em tempo constante. Sem token so passa se origem for trusted.
    if (token) {
      if (!timingSafeEqual(String(client.embed_token), String(token))) {
        return json({ error: 'Invalid token' }, 401, cors)
      }
    }

    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(client.auth_user_id)
    if (userErr || !userData?.user?.email) {
      return json({ error: 'Could not resolve auth user' }, 500, cors)
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    })

    if (linkErr || !linkData?.properties?.hashed_token) {
      return json({ error: 'Could not generate magiclink', detail: linkErr?.message }, 500, cors)
    }

    return json({
      token_hash: linkData.properties.hashed_token,
      email: userData.user.email,
      type: 'magiclink',
      auth_mode: token ? 'embed_token' : 'trusted_embed',
    }, 200, cors)
  } catch (err) {
    return json({ error: 'Internal error', detail: (err as Error).message }, 500, cors)
  }
})
