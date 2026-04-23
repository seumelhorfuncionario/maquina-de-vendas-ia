import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

// Edge function no SMF Hub (zslcotadwrwbdsylpwjc) que registra o comprovante de pagamento
// no agendamento. Chamada pelo agente IA (n8n em agent.vixhub.ai) quando o lead envia
// comprovante no WhatsApp logo apos receber o link de pagamento.
//
// Estrategia de match:
// 1) Se receber agendamento_id, atualiza ele direto (mais confiavel, o agente acabou de criar)
// 2) Se receber so telefone, busca o agendamento mais recente desse telefone no Agent Builder
//    (janela de 7 dias) e atualiza ele
//
// Corpo esperado:
// {
//   "agendamento_id": 96,          // opcional (prioridade)
//   "telefone": "558596325102",    // obrigatorio se agendamento_id faltar
//   "file_url": "https://...",     // URL publica do comprovante (Chatwoot active_storage, B2, etc)
//   "client_id": "51100010-..."    // opcional (valida o escopo quando presente)
// }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AGENTS_URL = 'https://wacotfqoarsbazrreeco.supabase.co';
const AGENTS_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY290ZnFvYXJzYmF6cnJlZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2NDU3NSwiZXhwIjoyMDg4OTQwNTc1fQ.F6zZ7f4XAP4jrhuKUHDajW4cnYGHncSoDuGDLavRZ2g';

const LOOKUP_WINDOW_DAYS = 7;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizePhone(raw: string): string {
  return String(raw).replace(/\D/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  const agendamentoId = body.agendamento_id != null ? Number(body.agendamento_id) : null;
  const telefoneRaw = typeof body.telefone === 'string' ? body.telefone : '';
  const fileUrl = typeof body.file_url === 'string' ? body.file_url.trim() : '';
  const clientIdFilter = typeof body.client_id === 'string' ? body.client_id : null;

  if (!fileUrl) return json({ error: 'Faltou file_url' }, 400);
  if (!agendamentoId && !telefoneRaw) return json({ error: 'Informe agendamento_id ou telefone' }, 400);

  const agents = createClient(AGENTS_URL, AGENTS_SERVICE_KEY);

  // Se tiver client_id, descobre os agent_ids permitidos (escopo de seguranca minima)
  let allowedAgentIds: number[] | null = null;
  if (clientIdFilter) {
    const smf = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const { data: client } = await smf.from('clients')
      .select('agent_whatsapp_id, agent_instagram_id')
      .eq('id', clientIdFilter)
      .single();
    if (!client) return json({ error: 'client_id nao encontrado' }, 404);
    const ids: number[] = [];
    if (client.agent_whatsapp_id) ids.push(client.agent_whatsapp_id);
    if (client.agent_instagram_id && client.agent_instagram_id !== client.agent_whatsapp_id) {
      ids.push(client.agent_instagram_id);
    }
    allowedAgentIds = ids;
  }

  // Resolve o agendamento alvo
  let targetId: number | null = agendamentoId;

  if (!targetId) {
    const telefone = normalizePhone(telefoneRaw);
    if (!telefone) return json({ error: 'Telefone invalido' }, 400);

    const since = new Date(Date.now() - LOOKUP_WINDOW_DAYS * 86400000).toISOString();
    let q = agents.from('agendamentos')
      .select('id, agente_id, telefone_cliente, criado_em, data_inicio, comprovante_url')
      .eq('telefone_cliente', telefone)
      .gte('criado_em', since)
      .order('criado_em', { ascending: false })
      .limit(1);
    if (allowedAgentIds && allowedAgentIds.length > 0) {
      q = q.in('agente_id', allowedAgentIds);
    }
    const { data: rows, error } = await q;
    if (error) return json({ error: error.message }, 500);
    if (!rows || rows.length === 0) {
      return json({ error: 'Nenhum agendamento recente pro telefone informado' }, 404);
    }
    targetId = rows[0].id;
  } else if (allowedAgentIds && allowedAgentIds.length > 0) {
    // Valida escopo: agendamento precisa pertencer aos agentes do client_id
    const { data: ag } = await agents.from('agendamentos')
      .select('agente_id')
      .eq('id', targetId)
      .single();
    if (!ag || !allowedAgentIds.includes(ag.agente_id)) {
      return json({ error: 'Agendamento fora do escopo do client_id' }, 403);
    }
  }

  // UPDATE
  const { data: updated, error: updErr } = await agents.from('agendamentos')
    .update({ comprovante_url: fileUrl })
    .eq('id', targetId)
    .select('id, nome_cliente, telefone_cliente, data_inicio, comprovante_url')
    .single();

  if (updErr) return json({ error: updErr.message }, 500);

  return json({
    success: true,
    agendamento: updated,
  });
});
