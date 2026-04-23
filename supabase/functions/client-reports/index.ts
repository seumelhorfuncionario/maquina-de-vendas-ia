import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AGENTS_URL = 'https://wacotfqoarsbazrreeco.supabase.co';
const AGENTS_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY290ZnFvYXJzYmF6cnJlZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2NDU3NSwiZXhwIjoyMDg4OTQwNTc1fQ.F6zZ7f4XAP4jrhuKUHDajW4cnYGHncSoDuGDLavRZ2g';

const DOW_NAMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

// Resolve período: aceita date_from/date_to (ISO strings) OU period_days (fallback)
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
      .select('id, business_name, agent_whatsapp_id, agent_instagram_id, appointment_value')
      .eq('id', clientId).single();
    if (!client) return new Response(JSON.stringify({ error: 'Cliente nao encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const agents = createClient(AGENTS_URL, AGENTS_SERVICE_KEY);
    const stats = await computeReportStats(agents, client, dateFromISO, dateToISO, periodDays);

    // Top lost reasons (analyzed_at dentro do período)
    const { data: lostReasons } = await admin
      .from('lead_lost_reasons')
      .select('category')
      .eq('client_id', clientId)
      .gte('analyzed_at', dateFromISO)
      .lte('analyzed_at', dateToISO);
    const reasonMap = new Map<string, number>();
    for (const r of lostReasons || []) reasonMap.set(r.category, (reasonMap.get(r.category) || 0) + 1);
    const totalAnalisados = (lostReasons || []).length;
    const top_lost_reasons = [...reasonMap.entries()]
      .map(([category, count]) => ({ category, count, pct: totalAnalisados > 0 ? Math.round((count / totalAnalisados) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count);

    return new Response(JSON.stringify({
      success: true,
      client_id: clientId,
      period_days: periodDays,
      date_from: dateFromISO,
      date_to: dateToISO,
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

  const { data: agendamentosPeriodo } = await agents.from('agendamentos')
    .select('id, data_inicio, status, telefone_cliente, criado_em')
    .in('agente_id', agentIds).gte('data_inicio', dateFromISO).lte('data_inicio', dateToISO).order('data_inicio', { ascending: true }).limit(5000);
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

  const phoneAgMap = new Map<string, string>();
  for (const a of agList) {
    if (!a.telefone_cliente || !a.criado_em) continue;
    const existing = phoneAgMap.get(a.telefone_cliente);
    if (!existing || new Date(a.criado_em) < new Date(existing)) phoneAgMap.set(a.telefone_cliente, a.criado_em);
  }
  const phones = [...phoneAgMap.keys()];
  const delays: number[] = [];
  if (phones.length > 0 && phones.length <= 500) {
    // Busca chats com janela expandida pra cobrir leads antigos que agendaram no período
    const chatWindowFrom = new Date(new Date(dateFromISO).getTime() - 60 * 86400000).toISOString();
    const { data: chatsMatched } = await agents.from('chats')
      .select('remotejid, criado_em')
      .in('agente_id', agentIds)
      .gte('criado_em', chatWindowFrom)
      .lte('criado_em', dateToISO)
      .limit(10000);
    const phoneChatMap = new Map<string, string>();
    for (const c of chatsMatched || []) {
      if (!c.remotejid || !c.criado_em) continue;
      for (const p of phones) {
        if (c.remotejid.startsWith(p)) {
          const existing = phoneChatMap.get(p);
          if (!existing || new Date(c.criado_em) < new Date(existing)) phoneChatMap.set(p, c.criado_em);
          break;
        }
      }
    }
    for (const [p, chatCriado] of phoneChatMap.entries()) {
      const agCriado = phoneAgMap.get(p);
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
