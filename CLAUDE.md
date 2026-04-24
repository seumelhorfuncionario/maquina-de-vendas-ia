# Sala do Chefe

SaaS multi-tenant de gestao comercial com IA (ex "Motor/Maquina de Vendas IA"). Frontend React + Vite + Tailwind, banco Supabase.

## Skills obrigatorias para qualquer mudanca de frontend

Antes de criar/alterar qualquer componente, pagina ou estilo, SEMPRE consultar as duas skills de design:

1. **`ui-ux-pro-max`** — sistema de design com 161 paletas, 57 pares tipograficos, 161 product types, 99 regras UX, 25 chart types. Use `python3 /root/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system` para recomendacoes completas, ou `--domain ux|style|color|typography|chart` pra busca direcionada. E obrigatorio pra decisoes de estilo, contraste, hierarquia, spacing, animacao e acessibilidade.

2. **`frontend-design`** — produz interfaces distintivas e production-grade. Use quando for construir componentes/paginas novas ou refatorar experiencia.

**Gatilhos obrigatorios (nao pular skill):**
- Criar pagina nova, dashboard, landing, form
- Refatorar card/modal/tabela/grafico
- Ajustar hover, tooltip, popover, empty state, loading
- Revisao pre-deploy de UI
- Qualquer reclamacao de "feio", "confuso", "dificil de ver"

**Antes de entregar UI rodar checklist do ui-ux-pro-max (§1-§3 CRITICAL: acessibilidade, touch, performance).**

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Banco**: Supabase (PostgreSQL) — ref: `zslcotadwrwbdsylpwjc`
- **Storage**: Backblaze B2 (S3-compatible) — bucket: `agents-smf`
- **Integracao**: Meta Ads API, CRM (Chatwoot), UazAPI (WhatsApp)
- **Deploy**: VPS, branch master

## Arquitetura

```
src/
  pages/           # Paginas (Dashboard, Leads, Vendas, Producao, Financeiro, Produtos, IAVision, Trafego, Criativos)
  components/      # Componentes compartilhados (TopNav, PageHeader, StatCard, Tooltip)
    traffic/       # Componentes do dashboard de trafego (abas, tabela, insights, criativos, SalesFunnel)
  hooks/           # Custom hooks (useTrafficData, useTrafficIntelligence, useSync, useLeads, useSalesFunnelData, etc)
  contexts/        # React contexts (AuthContext, TenantContext, ThemeContext)
  types/           # TypeScript types (index.ts, database.ts, traffic.ts)
  data/            # Mock data para demo mode (so usado quando isDemo=true -- em prod nunca mockar silencioso)
  integrations/    # Supabase client
```

**Layout**: menu horizontal superior (`TopNav.tsx`), não lateral. Container principal `max-w-[1600px] mx-auto` dentro do `Layout.tsx`. `EmbedView.tsx` tem variante sem chrome.

## Multi-tenancy

- `super_admins` — acesso admin global, gerencia clientes
- `clients` — cada cliente e um tenant com features habilitadas via `client_features`
- `TenantContext` — carrega features do cliente logado, controla o que aparece no menu. Super admin com `selectedClientId` no localStorage "visualiza como" outro cliente (precedencia sobre `clientProfile.id`)
- `AuthContext` — login via Supabase Auth, detecta se e super admin ou cliente
- Feature `ai_assistant` está **desabilitada globalmente** (`features.is_active=false`) — não aparece no super admin form nem no client_features_view. Reativar via UPDATE quando quiser religar

## Meta Ads — Arquitetura de Sync

### Token global + config por cliente
- **`META_ACCESS_TOKEN`** (env + Supabase secret no projeto `zslcotadwrwbdsylpwjc`): System User token do app **SMF_API** (`app_id 1534374867890770`), BM SMF (`business_id 1365988285074481`), nunca expira. Clientes compartilham os ativos deles (ad account, IG Business, page) com essa BM para a SMF gerenciar centralizadamente.
- **`clients.meta_ads_account_id`** (text) — formato `act_XXXXXXXX`. Configurado no super admin form, seção "Meta Ads & Instagram".
- **`clients.meta_instagram_account_id`** (text) — IG Business Account ID (17+ dígitos, ex: `17841415952686173`). NÃO é `agent_instagram_id` (esse é bigint, ID do agente Chatwoot pra filtrar chats; NÃO mexer).
- **`clients.meta_campaign_focuses`** (text[]) — multi-select: `whatsapp_leads | web_leads | sales | traffic | engagement`. Define o que o Dashboard enfatiza. Checkbox no super admin.

### Sync pipeline
Edge function **`sync-meta-ads`** (verify_jwt=true) puxa da Graph API:
- `GET /{ad_account}/campaigns?fields=id,name,objective,effective_status` — metadata
- `GET /{ad_account}/insights?level=campaign&time_increment=1&fields=campaign_id,spend,impressions,clicks,actions,action_values,cpm,cpc,ctr,date_start&time_range={since,until}` — performance diária
- UPSERT em `campaigns` via unique key `(client_id, campaign_id, date)`. Rows são **diárias**, não por campanha.

Parâmetros: `{client_id?, lookback_days?}`. Default lookback = 90d. Sem `client_id` sincroniza todos os clientes com ad account configurado.

**pg_cron** `sync-meta-ads-daily` (jobid 10): roda 06:00 UTC diário com `lookback_days=7` (UPSERT idempotente cobre últimos 7d pra capturar correções retroativas da Meta). Backfill manual 90d via botão "Sincronizar Meta" no `/trafego` (super admin).

### Action type → coluna mapping
Meta devolve arrays `actions[]` e `action_values[]`. Nosso `sumActions(arr, matchers[])` agrega por include match:
- `leads`: `lead`, `onsite_conversion.lead_grouped`
- `purchases`: `purchase`, `omni_purchase`, `offsite_conversion.fb_pixel_purchase`
- `link_clicks`: `link_click`
- `video_views`: `video_view`
- `engagement`: `post_engagement` (curtidas+comentários+saves — pode inflar pra campanhas de WhatsApp mesmo zeradas em lead real)
- `messaging_replies`: `onsite_conversion.messaging_conversation_started_7d`, `onsite_conversion.messaging_reply` — **métrica primária pra campanhas OUTCOME_ENGAGEMENT de WhatsApp**
- `revenue`: `sumActions(action_values, ['purchase', ...])`

## Dashboard de Trafego (`/trafego`)

Página usa abas por objetivo de campanha, auto-detectadas:
- **Visao Geral**: stats globais + funil + insights inteligentes
- **Captacao de Leads** (OUTCOME_LEADS): CPL, total leads, messaging
- **Vendas** (OUTCOME_SALES/CONVERSIONS): ROAS, receita, compras
- **Trafego** (OUTCOME_TRAFFIC/LINK_CLICKS): CPC, cliques, CPM
- **Engajamento** (OUTCOME_ENGAGEMENT/OUTCOME_AWARENESS): CPE, video views

### Fluxo de dados — CRÍTICO
`useTrafficData.ts` lê da tabela `campaigns` (rows diárias), **agrega por `campaign_id`** (soma totais, recomputa taxas cpm/cpc/ctr/roas do agregado pra evitar média-de-média) e retorna `campaigns: Campaign[]` com 1 entrada por campanha real. **NUNCA tratar `campaigns` como rows diárias** — antes da refatoração (commit `08fcb01`), o contador "120 campanhas" era 24 dias × 5 campanhas. Bug.

`creatives_performance` é popluada separadamente (ainda não via sync-meta-ads — TODO: estender o sync para incluir ads+creatives).

### Funil de Vendas (SalesFunnel) adapta ao foco
`useSalesFunnelData(campaigns, metrics, isDemo, focuses, agendamentos)` escolhe a fonte primária:
- **focuses inclui `whatsapp_leads`**: fonte = campanhas Meta SEMPRE. Contatos=`messagingReplies`, Vendas=`agendamentos.total` (de `useReportMetrics` → client-reports → tabela `agendamentos` no Agent System), Receita=`agendamentos × appointment_value`. Labels "Conversas iniciadas" + "Agendamentos".
- **focuses sem whatsapp_leads**: se `dashboardMetrics.leadsMonth || conversions || revenue > 0`, usa full funnel (leadsMonth = chats totais, conversions = sales table). Fallback = soma das campanhas.

### Mock fallback
`Trafego.tsx` **NUNCA** mostra mock silencioso em prod. Mock só se `isDemo===true`. Quando não há dados reais e não é demo, empty state explícito com CTA "Sincronizar Meta Ads agora (90 dias)".

Insights computados client-side em `useTrafficIntelligence.ts`.

## ⚠️ React hooks + early return — regra 🚨

Hooks (`useState`/`useEffect`/`useMemo`/`useCallback`/`useContext`/`useRef`/custom) DEVEM vir ANTES de qualquer `if (x) return`, ternário com return de JSX, ou branch condicional que encerra a função.

Violou = React error #310 (`Rendered more hooks than during the previous render`) = **tela preta em produção** porque em minified build o erro fica críptico e nenhum conteúdo renderiza.

Aconteceu em `Trafego.tsx` (commit `1410524`) quando `useMemo(whatsappBlock)` estava depois de `if (loading) return`. Quando `loading` mudava de `true→false` o número de hooks subia, React crashava.

**`tsc --noEmit` NÃO pega** (runtime rule). **Vite dev mode pega** (hot reload mostra warning). Em produção = tela preta.

Checklist: toda mudança em componente com hooks novos → conferir que todos os hooks estão no topo, antes de qualquer return condicional.

## Criativos (/criativos)

Kanban de conteudo: draft → review → approved → published.
Tabela `content_posts`. Suporta imagem e video (.mp4).

## Super Admin (/super-admin)

Form de cliente com secoes: Dados Basicos, CRM, **Meta Ads & Instagram**, Agentes IA, Dashboard Cards, Features.

Campos importantes no `clients`:
- `meta_ads_account_id` (text, `act_XXX`)
- `meta_instagram_account_id` (text, IG Business ID 17+ dígitos)
- `meta_campaign_focuses` (text[] — checkboxes multi-select pra definir foco do dashboard de tráfego)
- `kanban_board_ids` (text[])
- `cw_*` (Chatwoot: `cw_base_url`, `cw_api_token`, `cw_account_id`, `cw_enabled`)
- `agent_whatsapp_id`, `agent_instagram_id` (bigint, Chatwoot agent IDs — NÃO confundir com `meta_instagram_account_id`)
- `dashboard_config` (jsonb — toggles de cards)
- `appointment_value` (numeric — ticket médio pra estimar receita em focos `whatsapp_leads`/`web_leads`)

## Fonte da verdade do funil — NUNCA INVENTAR ESTAGIOS 🚨

A tabela `funnel_stages` (SMF Hub) e **espelho** do funil configurado no **Chatwoot** (`cw_base_url/api/v1/accounts/{cw_account_id}/funnels`). Os `etapa_fu` dos `chats` sao populados pelo edge function `kanban-sync` a partir dessa mesma API.

**Regra de ouro ao provisionar/corrigir funil de um cliente:**
1. NUNCA inventar `stage_name` nem usar um dicionario hardcoded baseado no `client_type`. O `SuperAdminClientForm.tsx` tem `FUNNEL_STAGES_BY_TYPE` — esses valores sao **apenas fallback** pra quando Chatwoot nao esta configurado ainda.
2. Se o cliente ja tem `cw_base_url` + `cw_api_token` + `cw_account_id`, **buscar os estagios reais**:
   ```
   GET {cw_base_url}/api/v1/accounts/{cw_account_id}/funnels
   Header: api_access_token: {cw_api_token}
   ```
   O campo `funnel.stages` retorna `{ stage_key: { name, ... } }`. O `stage_key` (ex: `"agendamento_realizado"`) e o valor que vai parar no `chats.etapa_fu` — entao `funnel_stages.stage_name` **deve casar com esse `stage_key`**, nao com o nome bonito.
3. Se o kanban aparecer vazio apesar de ter chats, o sintoma tipico e: `funnel_stages.stage_name` != `chats.etapa_fu`. Use `SELECT DISTINCT etapa_fu FROM chats WHERE client_id=...` pra ver a realidade e compare com `funnel_stages`.
4. Nomes humanizados visuais sao feitos por `useFunnelLabelConfig` (labels independentes do `stage_name`) — nao mexer no `stage_name` so pra ficar bonito.

**Contexto:** Isso foi aprendido provisionando Bumbum Clinic (2026-04-23) — provisionei 9 estagios de "clinica estetica" bonitos mas os 267 chats ja tinham `etapa_fu` = `Novo Lead | Qualificando | Orcamento Enviado | agendamento_realizado | comprovante_de_pagamento_recebido` vindos do Chatwoot. Nada casava e o kanban ficou vazio.

## Convencoes

- Linguagem: pt-BR na UI, ingles no codigo
- Commits: sempre push apos commit, sem perguntar
- Tema: dark-first, CSS variables (`--accent-cyan`, `--accent-green`, etc)
- Componente `Tooltip` generico disponivel em `src/components/Tooltip.tsx`
- Thumbnails de criativos via pipeline: Meta API → download → B2 upload → URL permanente
- RPC `update_creative_thumbnails(p_client_id, p_data)` para bulk update de thumbs (SECURITY DEFINER)

## Antes de entregar feature — TESTAR EM RUNTIME (via Vercel)

`tsc --noEmit` e `vite build` NAO sao suficientes. Passaram mas a feature pode nao funcionar no browser.

**Nao rodar `npm run dev` nem servidor local.** O usuario valida direto na Vercel.

Fluxo obrigatorio:
1. Commit + `git push` para `master` (ou merge da feature branch em `master`) — Vercel builda automatico em ~1-2min
2. Avisar o usuario com o hash do commit e pedir pra testar na Vercel
3. Verificar via MCP:
   - Edge Functions → `mcp__supabase-smf__get_logs` pra confirmar que foi chamada sem erro
   - Banco → `mcp__supabase-smf__execute_sql` pra conferir que INSERT/UPDATE funcionou
4. Se nao foi possivel testar 100% (ex: requer login de cliente especifico), falar EXPLICITAMENTE o que nao foi validado

Features que exigem atencao extra:
- Chama Edge Function → conferir log em producao apos primeira chamada real
- Le/escreve com RLS → so cliente logado valida
- Gatea por feature flag → confirmar flag ativa no `client_features_view`

## Env vars relevantes

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase principal
- `META_ACCESS_TOKEN` — System User token da SMF_API (local em `/root/Code/.env` + Supabase secret pra edge functions). Rotacionar exige atualizar `.env`, `.mcp.json`, E Supabase secret (via Management API `POST /projects/zslcotadwrwbdsylpwjc/secrets`)
- `META_BUSINESS_ID=1365988285074481`, `META_APP_ID=1534374867890770`
- `FACEBOOK_PAGE_ID` / `INSTAGRAM_ACCOUNT_ID` — da SMF (default/fallback), per-client sobrescreve via `clients.meta_instagram_account_id`
- B2: credenciais em `/root/Code/.env` (B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, B2_ENDPOINT, B2_REGION)

## Histórico recente (Abril 2026)

- Sidebar → TopNav horizontal (commit `f0492ea`)
- Meta Ads sync centralizado: sync-meta-ads edge fn + meta_campaign_focuses + whatsapp_leads block no funil (commits `721c2a3`, `e628568`, `08fcb01`, `fc972d1`)
- Fix React error #310 tela preta (commit `1410524`) — useMemo antes do early return
- Feature `ai_assistant` desativada globalmente (`features.is_active=false`)
- Levani (`51100010-ad6b-49da-a8b9-9f26f0d91780`) configurada com `act_787652476134534` + IG `17841415952686173` + foco `whatsapp_leads`
