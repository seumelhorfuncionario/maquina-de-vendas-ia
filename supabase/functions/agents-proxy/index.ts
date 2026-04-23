import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENTS_URL = 'https://wacotfqoarsbazrreeco.supabase.co';
const AGENTS_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY290ZnFvYXJzYmF6cnJlZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2NDU3NSwiZXhwIjoyMDg4OTQwNTc1fQ.F6zZ7f4XAP4jrhuKUHDajW4cnYGHncSoDuGDLavRZ2g';

const AGEND_SELECT = 'id, nome_cliente, procedimento, data_inicio, data_fim, status, telefone_cliente, comprovante_url';

function buildChatwootUrl(cwBaseUrl: string | null, cwAccountId: string | null, conversationId: string | null): string | null {
  if (!cwBaseUrl || !cwAccountId || !conversationId) return null;
  return `${cwBaseUrl}/app/accounts/${cwAccountId}/conversations/${conversationId}`;
}

async function getChatMap(agentsDb: ReturnType<typeof createClient>, agentId: number): Promise<Map<string, string>> {
  const { data } = await agentsDb
    .from('chats')
    .select('remotejid, conversation_id')
    .eq('agente_id', agentId)
    .not('conversation_id', 'is', null);
  const map = new Map<string, string>();
  for (const row of (data || [])) {
    if (row.remotejid && row.conversation_id) map.set(row.remotejid, row.conversation_id);
  }
  return map;
}

function enrichAgendamentos(agendamentos: any[], chatMap: Map<string, string>) {
  return agendamentos.map(ag => ({
    ...ag,
    conversation_id: chatMap.get(ag.remotejid) ?? null,
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { clientId, dateFrom } = await req.json();

    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Missing clientId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const smfSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: client } = await smfSupabase
      .from('clients')
      .select('agent_whatsapp_id, agent_instagram_id, appointment_value, cw_base_url, cw_account_id')
      .eq('id', clientId)
      .single();

    const wppId = client?.agent_whatsapp_id;
    const igId = client?.agent_instagram_id;
    const appointmentValue = client?.appointment_value || 0;
    const cwBaseUrl = client?.cw_base_url || null;
    const cwAccountId = client?.cw_account_id ? String(client.cw_account_id) : null;

    const empty = {
      agendamentos: [], agendamentosCount: 0,
      chatsWhatsapp: 0, chatsWhatsappTotal: 0,
      chatsInstagram: 0, chatsInstagramTotal: 0,
      appointmentValue: 0, estimatedRevenue: 0,
      cwBaseUrl, cwAccountId,
    };

    if (!wppId && !igId) {
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const agentsDb = createClient(AGENTS_URL, AGENTS_SERVICE_KEY);

    const now = new Date();
    const fallbackDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const sinceDate = dateFrom || fallbackDate;

    const sameAgent = wppId && igId && wppId === igId;

    if (sameAgent) {
      const agentId = wppId;

      const [agendRes, chatMap, wppPeriod, wppTotal, igPeriod, igTotal] = await Promise.all([
        agentsDb.from('agendamentos')
          .select(AGEND_SELECT)
          .eq('agente_id', agentId)
          .gte('data_inicio', sinceDate)
          .order('data_inicio', { ascending: true }),
        getChatMap(agentsDb, agentId),
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', agentId)
          .gte('criado_em', sinceDate)
          .like('remotejid', '%@s.whatsapp.net'),
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', agentId)
          .like('remotejid', '%@s.whatsapp.net'),
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', agentId)
          .gte('criado_em', sinceDate)
          .not('remotejid', 'like', '%@s.whatsapp.net'),
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', agentId)
          .not('remotejid', 'like', '%@s.whatsapp.net'),
      ]);

      const agendamentos = enrichAgendamentos(agendRes.data || [], chatMap);
      const agendamentosCount = agendamentos.length;

      return new Response(JSON.stringify({
        agendamentos,
        agendamentosCount,
        chatsWhatsapp: wppPeriod.count || 0,
        chatsWhatsappTotal: wppTotal.count || 0,
        chatsInstagram: igPeriod.count || 0,
        chatsInstagramTotal: igTotal.count || 0,
        appointmentValue,
        estimatedRevenue: agendamentosCount * appointmentValue,
        cwBaseUrl,
        cwAccountId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Agentes separados
    const promises: Promise<any>[] = [];

    if (wppId) {
      promises.push(
        agentsDb.from('agendamentos')
          .select(AGEND_SELECT)
          .eq('agente_id', wppId)
          .gte('data_inicio', sinceDate)
          .order('data_inicio', { ascending: true })
      );
      promises.push(getChatMap(agentsDb, wppId));
      promises.push(
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', wppId)
          .gte('criado_em', sinceDate)
      );
      promises.push(
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', wppId)
      );
    } else {
      promises.push(Promise.resolve({ data: [] }));
      promises.push(Promise.resolve(new Map()));
      promises.push(Promise.resolve({ count: 0 }));
      promises.push(Promise.resolve({ count: 0 }));
    }

    if (igId) {
      promises.push(
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', igId)
          .gte('criado_em', sinceDate)
      );
      promises.push(
        agentsDb.from('chats')
          .select('id', { count: 'exact', head: true })
          .eq('agente_id', igId)
      );
      promises.push(
        agentsDb.from('agendamentos')
          .select(AGEND_SELECT)
          .eq('agente_id', igId)
          .gte('data_inicio', sinceDate)
          .order('data_inicio', { ascending: true })
      );
      promises.push(getChatMap(agentsDb, igId));
    } else {
      promises.push(Promise.resolve({ count: 0 }));
      promises.push(Promise.resolve({ count: 0 }));
      promises.push(Promise.resolve({ data: [] }));
      promises.push(Promise.resolve(new Map()));
    }

    const [agendWpp, chatMapWpp, chatsWppPeriod, chatsWppTotal, chatsIgPeriod, chatsIgTotal, agendIg, chatMapIg] = await Promise.all(promises);

    // Mesclar mapas de chats (wpp e ig podem ser agentes diferentes)
    const mergedChatMap = new Map([...chatMapWpp, ...chatMapIg]);

    const allAgendamentos = enrichAgendamentos([
      ...(agendWpp.data || []),
      ...(agendIg.data || []),
    ].sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()), mergedChatMap);

    const agendamentosCount = allAgendamentos.length;

    return new Response(JSON.stringify({
      agendamentos: allAgendamentos,
      agendamentosCount,
      chatsWhatsapp: chatsWppPeriod.count || 0,
      chatsWhatsappTotal: chatsWppTotal.count || 0,
      chatsInstagram: chatsIgPeriod.count || 0,
      chatsInstagramTotal: chatsIgTotal.count || 0,
      appointmentValue,
      estimatedRevenue: agendamentosCount * appointmentValue,
      cwBaseUrl,
      cwAccountId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Agents proxy error:', err);
    return new Response(JSON.stringify({
      error: String(err), agendamentos: [], agendamentosCount: 0,
      chatsWhatsapp: 0, chatsWhatsappTotal: 0,
      chatsInstagram: 0, chatsInstagramTotal: 0,
      appointmentValue: 0, estimatedRevenue: 0,
      cwBaseUrl: null, cwAccountId: null,
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
