import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AGENTS_URL = 'https://wacotfqoarsbazrreeco.supabase.co';
const AGENTS_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY290ZnFvYXJzYmF6cnJlZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2NDU3NSwiZXhwIjoyMDg4OTQwNTc1fQ.F6zZ7f4XAP4jrhuKUHDajW4cnYGHncSoDuGDLavRZ2g';

const DOW_NAMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const MAX_CHATS_PER_CATEGORY = 20;

// Resolve periodo: aceita date_from/date_to (ISO strings) OU period_days (fallback)
function resolvePeriod(body: any): { dateFromISO: string; dateToISO: string; periodDays: number } {
  const now = new Date();
  const toISO = typeof body.date_to === 'string' ? body.date_to : now.toISOString();
  if (typeof body.date_from === 'string') {
    const fromISO = body.date_from;
    const days = Math.max(1, Math.round((new Date(toISO).getTime() - new Date(fromISO).getTime()) / 86400000));
    return { dateFromISO: fromISO, dateToISO: toISO, periodDays: days };
  }
  const days = Number(body.period_days || 30);
  const fromISO = new Date(now.getTime() - days * 86400000).toISOString();
  return { dateFromISO: fromISO, dateToISO: toISO, periodDays: days };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nao autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    let clientId = body.client_id as string | undefined;
    const { dateFromISO, dateToISO, periodDays } = resolvePeriod(body);

    if (!clientId) {
      const { data: c } = await supabaseClient.from('clients').select('id').eq('auth_user_id', user.id).single();
      if (!c) return new Response(JSON.stringify({ error: 'Cliente nao encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      clientId = c.id;
    }
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: client } = await admin.from('clients')
      .select('id, business_name, agent_whatsapp_id, agent_instagram_id, appointment_value, cw_base_url, cw_account_id')
      .eq('id', clientId).single();
    if (!client) return new Response(JSON.stringify({ error: 'Cliente nao encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const agents = createClient(AGENTS_URL, AGENTS_SERVICE_KEY);
    const stats = await computeReportStats(agents, client, dateFromISO, dateToISO, periodDays);

    // Top lost reasons (analyzed_at dentro do periodo) com sample de chats por categoria
    const { data: lostReasons } = await admin
      .from('lead_lost_reasons')
      .select('category, chat_external_id, excerpt, analyzed_at')
      .eq('client_id', clientId)
      .gte('analyzed_at', dateFromISO)
      .lte('analyzed_at', dateToISO)
      .order('analyzed_at', { ascending: false });

    const reasonMap = new Map<string, { count: number; chats: { chat_external_id: string; excerpt: string | null }[] }>();
    for (const r of lostReasons || []) {
      const entry = reasonMap.get(r.category) || { count: 0, chats: [] };
      entry.count++;
      if (entry.chats.length < MAX_CHATS_PER_CATEGORY) {
        entry.chats.push({ chat_external_id: r.chat_external_id, excerpt: r.excerpt });
      }
      reasonMap.set(r.category, entry);
    }
    const totalAnalisados = (lostReasons || []).length;

    // Enriquece chats com conversation_id (pra montar URL Chatwoot)
    const allRemotejids = new Set<string>();
    for (const { chats } of reasonMap.values()) {
      for (const c of chats) if (c.chat_external_id) allRemotejids.add(c.chat_external_id);
    }
    const conversationIdMap = new Map<string, string>();
    if (allRemotejids.size > 0) {
      const agentIds: number[] = [];
      if (client.agent_whatsapp_id) agentIds.push(client.agent_whatsapp_id);
      if (client.agent_instagram_id && client.agent_instagram_id !== client.agent_whatsapp_id) agentIds.push(client.agent_instagram_id);
      if (agentIds.length > 0) {
        const { data: chatRows } = await agents.from('chats')
          .select('remotejid, conversation_id')
          .in('agente_id', agentIds)
          .in('remotejid', [...allRemotejids])
          .not('conversation_id', 'is', null);
        for (const c of chatRows || []) {
          if (c.remotejid && c.conversation_id) conversationIdMap.set(c.remotejid, c.conversation_id);
        }
      }
    }

    const top_lost_reasons = [...reasonMap.entries()]
      .map(([category, { count, chats }]) => ({
        category,
        count,
        pct: totalAnalisados > 0 ? Math.round((count / totalAnalisados) * 1000) / 10 : 0,
        chats: chats.map(c => ({
          chat_external_id: c.chat_external_id,
          excerpt: c.excerpt,
          conversation_id: conversationIdMap.get(c.chat_external_id) ?? null,
        })),
      }))
      .sort((a, b) => b.count - a.count);

    return new Response(JSON.stringify({
      success: true,
      client_id: clientId,
      period_days: periodDays,
      date_from: dateFromISO,
      date_to: dateToISO,
      cw_base_url: client.cw_base_url || null,
      cw_account_id: client.cw_account_id ? String(client.cw_account_id) : null,
      stats: { ...stats, top_lost_reasons, total_analisados: totalAnalisados }
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function computeReportStats(agents: any, client: any, dateFromISO: string, dateToISO: string, periodDays: number) {
  const wppId = client.agent_whatsapp_id;
  const igId = client.agent_instagram_id;
  if (!wppId && !igId) return null;
  const agentIds: number[] = [];
  if (wppId) agentIds.push(wppId);
  if (igId && igId !== wppId) agentIds.push(igId);

  const sameAgent = wppId && igId && wppId === igId;

  let chatsWppPeriodo = 0;
  let chatsIgPeriodo = 0;
  if (sameAgent) {
    const [wpp, ig] = await Promise.all([
      agents.from('chats').select('id', { count: 'exact', head: true }).eq('agente_id', wppId).gte('criado_em', dateFromISO).lte('criado_em', dateToISO).like('remotejid', '%@s.whatsapp.net'),
      agents.from('chats').select('id', { count: 'exact', head: true }).eq('agente_id', wppId).gte('criado_em', dateFromISO).lte('criado_em', dateToISO).not('remotejid', 'like', '%@s.whatsapp.net'),
    ]);
    chatsWppPeriodo = wpp.count || 0;
    chatsIgPeriodo = ig.count || 0;
  } else {
    const promises: Promise<any>[] = [];
    if (wppId) promises.push(agents.from('chats').select('id', { count: 'exact', head: true }).eq('agente_id', wppId).gte('criado_em', dateFromISO).lte('criado_em', dateToISO));
    else promises.push(Promise.resolve({ count: 0 }));
    if (igId) promises.push(agents.from('chats').select('id', { count: 'exact', head: true }).eq('agente_id', igId).gte('criado_em', dateFromISO).lte('criado_em', dateToISO));
    else promises.push(Promise.resolve({ count: 0 }));
    const [wpp, ig] = await Promise.all(promises);
    chatsWppPeriodo = wpp.count || 0;
    chatsIgPeriodo = ig.count || 0;
  }
  const atendimentosPeriodo = chatsWppPeriodo + chatsIgPeriodo;

  // Consistencia com /agendamentos: contamos tudo que vai acontecer a partir do inicio
  // do periodo (sem teto), pra incluir futuros ja marcados. Assim KPI "Agendamentos"
  // bate com a lista da pagina operacional.
  const { data: agendamentosPeriodo } = await agents.from('agendamentos')
    .select('id, data_inicio, status, telefone_cliente, criado_em, remotejid')
    .in('agente_id', agentIds).gte('data_inicio', dateFromISO).order('data_inicio', { ascending: true }).limit(5000);
  const agList = agendamentosPeriodo || [];

  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const a of agList) {
    if (!a.data_inicio) continue;
    const utc = new Date(a.data_inicio);
    const brt = new Date(utc.getTime() - 3 * 3600000);
    heatmap[brt.getUTCDay()][brt.getUTCHours()]++;
  }
  const topDowHora: { dow: number; hora: number; count: number; dow_nome: string }[] = [];
  for (let dow = 0; dow < 7; dow++) for (let h = 0; h < 24; h++) {
    if (heatmap[dow][h] > 0) topDowHora.push({ dow, hora: h, count: heatmap[dow][h], dow_nome: DOW_NAMES[dow] });
  }
  topDowHora.sort((a, b) => b.count - a.count);

  const statusMap = new Map<string, number>();
  for (const a of agList) {
    const s = (a.status as string) || 'sem_status';
    statusMap.set(s, (statusMap.get(s) || 0) + 1);
  }
  const topStatus = [...statusMap.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);

  // Mapeia remotejid -> criado_em do agendamento mais antigo (caso mesmo lead agende varias vezes).
  // Usa o remotejid direto do agendamento em vez de prefix-match do telefone,
  // evitando o cap de 1000 rows do PostgREST em .from('chats').limit().
  const ridAgMap = new Map<string, string>();
  for (const a of agList) {
    if (!a.remotejid || !a.criado_em) continue;
    const existing = ridAgMap.get(a.remotejid);
    if (!existing || new Date(a.criado_em) < new Date(existing)) ridAgMap.set(a.remotejid, a.criado_em);
  }
  const remotejids = [...ridAgMap.keys()];
  const delays: number[] = [];
  if (remotejids.length > 0 && remotejids.length <= 500) {
    // Busca o chat mais antigo para CADA remotejid exato. Sem janela inferior —
    // um lead pode ter agendado agora apos conversar meses atras.
    const { data: chatsMatched } = await agents.from('chats')
      .select('remotejid, criado_em')
      .in('agente_id', agentIds)
      .in('remotejid', remotejids)
      .lte('criado_em', dateToISO)
      .order('criado_em', { ascending: true });
    const ridChatMap = new Map<string, string>();
    for (const c of chatsMatched || []) {
      if (!c.remotejid || !c.criado_em) continue;
      if (!ridChatMap.has(c.remotejid)) ridChatMap.set(c.remotejid, c.criado_em);
    }
    for (const [rid, chatCriado] of ridChatMap.entries()) {
      const agCriado = ridAgMap.get(rid);
      if (!agCriado) continue;
      const diff = (new Date(agCriado).getTime() - new Date(chatCriado).getTime()) / 3600000;
      if (diff >= 0) delays.push(diff);
    }
  }
  delays.sort((a, b) => a - b);
  const n = delays.length;
  const mean = n > 0 ? delays.reduce((s, d) => s + d, 0) / n : null;
  const p50 = n > 0 ? delays[Math.floor(n * 0.5)] : null;
  const p90 = n > 0 ? delays[Math.floor(n * 0.9)] : null;

  const taxaAgendamento = atendimentosPeriodo > 0 ? Math.round((agList.length / atendimentosPeriodo) * 1000) / 10 : 0;

  return {
    period_days: periodDays,
    atendimentos: { total: atendimentosPeriodo, whatsapp: chatsWppPeriodo, instagram: chatsIgPeriodo },
    agendamentos: { total: agList.length, valor_medio: Number(client.appointment_value) || 0, receita_estimada: agList.length * (Number(client.appointment_value) || 0) },
    taxa_agendamento_pct: taxaAgendamento,
    heatmap,
    top_dow_hora: topDowHora.slice(0, 10),
    top_status: topStatus,
    tempo_ate_agendar: { amostra: n, mediana_h: p50 ? Math.round(p50 * 10) / 10 : null, media_h: mean ? Math.round(mean * 10) / 10 : null, p90_h: p90 ? Math.round(p90 * 10) / 10 : null },
    nao_agendaram: { total: atendimentosPeriodo - agList.length, pct: atendimentosPeriodo > 0 ? Math.round(((atendimentosPeriodo - agList.length) / atendimentosPeriodo) * 1000) / 10 : 0 }
  };
}
