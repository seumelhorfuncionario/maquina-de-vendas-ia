# Motor de Vendas IA

SaaS multi-tenant de gestao comercial com IA. Frontend React + Vite + Tailwind, banco Supabase.

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
  components/      # Componentes compartilhados (Sidebar, PageHeader, StatCard, Tooltip)
    traffic/       # Componentes do dashboard de trafego (abas, tabela, insights, criativos)
  hooks/           # Custom hooks (useTrafficData, useTrafficIntelligence, useSync, useLeads, etc)
  contexts/        # React contexts (AuthContext, TenantContext, ThemeContext)
  types/           # TypeScript types (index.ts, database.ts, traffic.ts)
  data/            # Mock data para demo mode
  integrations/    # Supabase client
```

## Multi-tenancy

- `super_admins` — acesso admin global, gerencia clientes
- `clients` — cada cliente e um tenant com features habilitadas via `client_features`
- `TenantContext` — carrega features do cliente logado, controla o que aparece no menu
- `AuthContext` — login via Supabase Auth, detecta se e super admin ou cliente

## Dashboard de Trafego (redesign recente)

Pagina `/trafego` usa abas por objetivo de campanha, auto-detectadas:
- **Visao Geral**: stats globais + insights inteligentes + resumo por grupo
- **Captacao de Leads** (OUTCOME_LEADS): CPL, total leads, messaging
- **Vendas** (OUTCOME_SALES/CONVERSIONS): ROAS, receita, compras
- **Trafego** (OUTCOME_TRAFFIC/LINK_CLICKS): CPC, cliques, CPM
- **Engajamento** (OUTCOME_ENGAGEMENT/OUTCOME_AWARENESS): CPE, video views

Dados vem das tabelas `campaigns` e `creatives_performance` (populadas via Meta Ads API).
Insights computados client-side em `useTrafficIntelligence.ts`.

## Criativos (/criativos)

Kanban de conteudo: draft → review → approved → published.
Tabela `content_posts`. Suporta imagem e video (.mp4).

## Super Admin (/super-admin)

Form de cliente com secoes: Dados Basicos, CRM, Meta Ads, Agentes IA, Dashboard Cards, Features.
Campos importantes no `clients`: `meta_ads_account_id`, `kanban_board_ids`, `cw_*`, `agent_*_id`, `dashboard_config`.

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
- `META_ACCESS_TOKEN` — Token da Meta Ads API
- `FACEBOOK_PAGE_ID` / `INSTAGRAM_ACCOUNT_ID` — IDs da pagina/conta
- B2: credenciais em `/root/Code/.env` (B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, B2_ENDPOINT, B2_REGION)
