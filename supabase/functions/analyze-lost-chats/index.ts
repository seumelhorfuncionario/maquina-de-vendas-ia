import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AGENTS_URL = 'https://wacotfqoarsbazrreeco.supabase.co';
const AGENTS_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY290ZnFvYXJzYmF6cnJlZWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2NDU3NSwiZXhwIjoyMDg4OTQwNTc1fQ.F6zZ7f4XAP4jrhuKUHDajW4cnYGHncSoDuGDLavRZ2g';

// xAI direto. grok-4.1-fast = barato e rapido pra classificacao pt-BR.
// XAI_API_KEY deve estar setada como secret do edge function (via dashboard
// Supabase > Edge Functions > Secrets). Sem ela, a function loga erro e retorna null.
const MODEL = 'grok-4.1-fast';
const XAI_URL = 'https://api.x.ai/v1/chat/completions';

const CATEGORY_SCHEMA = `{
  "preco": "Reclamou do valor, pediu desconto, falou que esta caro, ou desistiu por preco",
  "horario": "Nao conseguiu encontrar horario compativel, pediu horario fora do disponivel",
  "sem_resposta": "Iniciou a conversa mas parou de responder. Sem objecao clara.",
  "duvida_nao_sanada": "Fez perguntas e nao obteve resposta suficiente, ou duvida tecnica especifica bloqueou o agendamento",
  "ja_tem_outro": "Disse que ja tem profissional/concorrente/solucao similar",
  "nao_qualificado": "Nao se encaixa no perfil do cliente (regiao errada, idade, caso nao atendido, etc)",
  "pesquisando": "Esta pesquisando, pediu para pensar, disse que volta depois",
  "outro": "Motivo nao se encaixa em nenhuma das categorias acima"
}`;

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
    // Sem teto artificial: processa ate 200 por chamada pra nao estourar timeout da edge function.
    // Frontend chama em loop ate pendingAnalysis = 0. Assim cobre amostra total.
    const batchSize = Math.max(Number(body.batch_size || 50), 1);
    const cap = Math.min(batchSize, 200);
    const periodDays = Number(body.period_days || 30);

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
      .select('id, business_name, business_niche, business_context, agent_whatsapp_id, agent_instagram_id')
      .eq('id', clientId).single();
    if (!client) return new Response(JSON.stringify({ error: 'Cliente nao encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const agentIds: number[] = [];
    if (client.agent_whatsapp_id) agentIds.push(client.agent_whatsapp_id);
    if (client.agent_instagram_id && client.agent_instagram_id !== client.agent_whatsapp_id) agentIds.push(client.agent_instagram_id);
    if (agentIds.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Cliente sem agentes configurados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const agents = createClient(AGENTS_URL, AGENTS_SERVICE_KEY);
    const dPeriod = new Date(Date.now() - periodDays * 86400000).toISOString();

    const { data: agendamentos } = await agents.from('agendamentos')
      .select('telefone_cliente').in('agente_id', agentIds).gte('data_inicio', dPeriod).limit(10000);
    const phonesComAgendamento = new Set((agendamentos || []).map((a: any) => (a.telefone_cliente || '').replace(/\D/g, '')));

    // Aumentado 1000 -> 10000 pra nao truncar amostra em cliente com muito chat
    const { data: chatsAll } = await agents.from('chats')
      .select('id, remotejid, ultima_mensagem_em, criado_em')
      .in('agente_id', agentIds)
      .gte('criado_em', dPeriod)
      .order('criado_em', { ascending: false })
      .limit(10000);
    const chats = chatsAll || [];

    const { data: alreadyAnalyzed } = await admin.from('lead_lost_reasons')
      .select('chat_external_id').eq('client_id', clientId);
    const analyzedSet = new Set((alreadyAnalyzed || []).map((r: any) => r.chat_external_id));

    const losses = chats.filter((c: any) => {
      if (!c.remotejid) return false;
      if (analyzedSet.has(c.remotejid)) return false;
      const phone = c.remotejid.replace(/@.*/, '').replace(/\D/g, '');
      return !phonesComAgendamento.has(phone);
    });

    console.log(`[analyze-lost-chats] client ${clientId}: ${chats.length} chats total, ${losses.length} sem agendamento + nao analisados, processando ${Math.min(cap, losses.length)}`);

    const toProcess = losses.slice(0, cap);
    if (toProcess.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0, pending: 0, message: 'Nenhum chat novo para analisar' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const chatIds = toProcess.map((c: any) => c.id);
    const { data: interacoes } = await agents.from('interacoes')
      .select('chat_id, mensagem_usuario, resposta_agente, criado_em')
      .in('chat_id', chatIds).order('criado_em', { ascending: true }).limit(15000);

    const conversasByChat = new Map<number, any[]>();
    for (const ic of interacoes || []) {
      const arr = conversasByChat.get(ic.chat_id) || [];
      arr.push(ic);
      conversasByChat.set(ic.chat_id, arr);
    }

    const results: any[] = [];
    for (const chat of toProcess) {
      const msgs = conversasByChat.get(chat.id) || [];
      if (msgs.length === 0) {
        await admin.from('lead_lost_reasons').upsert({
          client_id: clientId, chat_external_id: chat.remotejid,
          category: 'sem_resposta', excerpt: null, confidence: 0.9
        }, { onConflict: 'client_id,chat_external_id' });
        results.push({ chat_id: chat.id, category: 'sem_resposta', confidence: 0.9 });
        continue;
      }

      const conversaText = msgs.slice(-20).map((m: any) => {
        const u = m.mensagem_usuario ? `LEAD: ${m.mensagem_usuario}` : '';
        const a = m.resposta_agente ? `IA: ${m.resposta_agente}` : '';
        return [u, a].filter(Boolean).join('\n');
      }).filter(Boolean).join('\n\n').slice(0, 4000);

      const classification = await classifyWithAI(conversaText, client);
      if (classification) {
        await admin.from('lead_lost_reasons').upsert({
          client_id: clientId, chat_external_id: chat.remotejid,
          category: classification.category, excerpt: classification.excerpt,
          confidence: classification.confidence
        }, { onConflict: 'client_id,chat_external_id' });
        results.push({ chat_id: chat.id, category: classification.category, confidence: classification.confidence });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      pending: losses.length - results.length,
      results: results.slice(0, 10)
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

interface Classification {
  category: string;
  excerpt: string | null;
  confidence: number;
}

async function classifyWithAI(conversaText: string, client: any): Promise<Classification | null> {
  const apiKey = Deno.env.get('XAI_API_KEY');
  if (!apiKey) {
    console.error('XAI_API_KEY nao configurada — setar em Supabase > Edge Functions > Secrets');
    return null;
  }

  const contexto = `Negocio: ${client.business_name || 'n/a'} | Nicho: ${client.business_niche || 'n/a'}`;
  const systemPrompt = `Voce categoriza por que um lead NAO AGENDOU apos falar com a IA. Retorne APENAS JSON valido com esse schema:
{
  "category": "preco" | "horario" | "sem_resposta" | "duvida_nao_sanada" | "ja_tem_outro" | "nao_qualificado" | "pesquisando" | "outro",
  "excerpt": "trecho literal da conversa que justifica a categoria (max 200 chars) ou null se nao tiver trecho",
  "confidence": numero entre 0 e 1
}

CATEGORIAS:
${CATEGORY_SCHEMA}

REGRAS:
- Se o lead mandou apenas saudacao e parou de responder, use "sem_resposta"
- Se falou que esta caro ou pediu desconto, "preco"
- Se pediu horario especifico que nao existe ou reclamou do horario, "horario"
- Se disse "vou pensar", "depois falo", "tô olhando", use "pesquisando"
- Evite "outro" — so use se realmente nao se encaixar. Prefira "sem_resposta" se dados insuficientes.
- confidence > 0.7 so se o trecho literal for claro.`;

  const userPrompt = `${contexto}\n\nCONVERSA (ultimos 20 turnos):\n${conversaText}\n\nRetorne o JSON.`;

  try {
    const res = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`xAI error ${res.status}:`, errText);
      return null;
    }
    const d = await res.json();
    const content = d.choices?.[0]?.message?.content;
    if (!content) {
      console.error('xAI retornou sem content:', JSON.stringify(d));
      return null;
    }
    const parsed = JSON.parse(content);
    const validCategories = ['preco', 'horario', 'sem_resposta', 'duvida_nao_sanada', 'ja_tem_outro', 'nao_qualificado', 'pesquisando', 'outro'];
    if (!validCategories.includes(parsed.category)) {
      console.warn('Invalid category from AI:', parsed.category);
      return null;
    }
    return {
      category: parsed.category,
      excerpt: parsed.excerpt || null,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5
    };
  } catch (e) {
    console.error('classify error:', e);
    return null;
  }
}
