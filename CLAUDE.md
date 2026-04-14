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

## Convencoes

- Linguagem: pt-BR na UI, ingles no codigo
- Commits: sempre push apos commit, sem perguntar
- Tema: dark-first, CSS variables (`--accent-cyan`, `--accent-green`, etc)
- Componente `Tooltip` generico disponivel em `src/components/Tooltip.tsx`
- Thumbnails de criativos via pipeline: Meta API → download → B2 upload → URL permanente
- RPC `update_creative_thumbnails(p_client_id, p_data)` para bulk update de thumbs (SECURITY DEFINER)

## Env vars relevantes

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase principal
- `META_ACCESS_TOKEN` — Token da Meta Ads API
- `FACEBOOK_PAGE_ID` / `INSTAGRAM_ACCOUNT_ID` — IDs da pagina/conta
- B2: credenciais em `/root/Code/.env` (B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, B2_ENDPOINT, B2_REGION)
