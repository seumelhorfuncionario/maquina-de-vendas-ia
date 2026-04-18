import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Constant-time comparison of two hex/uuid strings
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const { client_id, token } = await req.json()
    if (!client_id || !token) {
      return json({ error: 'client_id and token are required' }, 400)
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

    if (clientErr || !client) return json({ error: 'Client not found' }, 404)
    if (!client.is_active) return json({ error: 'Client inactive' }, 403)
    if (!client.auth_user_id) return json({ error: 'Client has no auth user bound' }, 400)

    // Validate token with constant-time compare
    if (!timingSafeEqual(String(client.embed_token), String(token))) {
      return json({ error: 'Invalid token' }, 401)
    }

    // Fetch the user's email so we can generate a magiclink for them
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(client.auth_user_id)
    if (userErr || !userData?.user?.email) {
      return json({ error: 'Could not resolve auth user' }, 500)
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    })

    if (linkErr || !linkData?.properties?.hashed_token) {
      return json({ error: 'Could not generate magiclink', detail: linkErr?.message }, 500)
    }

    return json({
      token_hash: linkData.properties.hashed_token,
      email: userData.user.email,
      type: 'magiclink',
    })
  } catch (err) {
    return json({ error: 'Internal error', detail: (err as Error).message }, 500)
  }
})
