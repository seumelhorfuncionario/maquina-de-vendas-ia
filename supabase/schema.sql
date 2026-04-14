-- Motor de Vendas IA — Schema Principal
-- Supabase ref: zslcotadwrwbdsylpwjc
-- Gerado em: 2026-04-14

-- ============================================
-- AUTENTICACAO / ADMIN
-- ============================================

CREATE TABLE super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CLIENTES (TENANTS)
-- ============================================

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid,                              -- FK para auth.users
  email text NOT NULL,
  business_name text NOT NULL,
  business_niche text NOT NULL,
  client_type text DEFAULT 'product_sales',        -- product_sales | scheduling | services
  is_active boolean DEFAULT true,
  dashboard_configured boolean DEFAULT false,

  -- CRM (ex-Chatwoot)
  cw_enabled boolean DEFAULT false,
  cw_account_id text,
  cw_api_token text,
  cw_base_url text DEFAULT 'https://app.chatwoot.com',
  cw_last_sync_at timestamptz,

  -- Meta Ads
  meta_ads_account_id text,                        -- formato: act_XXXXXXXXXX

  -- Kanban
  kanban_api_url text,
  kanban_api_token text,
  kanban_board_ids text[] DEFAULT '{}',

  -- Agentes IA
  agent_whatsapp_id integer,
  agent_instagram_id integer,
  agents_supabase_ref text DEFAULT 'wacotfqoarsbazrreeco',
  appointment_value numeric DEFAULT 0,

  -- Config
  dashboard_config jsonb DEFAULT '{"profit":true,"revenue":true,"conversions":true,"leads_month":true,"leads_today":true,"traffic_cost":true,"material_cost":true,"conversion_rate":true}',
  qualified_criteria text,
  monthly_revenue_goal numeric DEFAULT 0,
  average_ticket numeric DEFAULT 0,
  business_context text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- FEATURES (FEATURE FLAGS POR CLIENTE)
-- ============================================

CREATE TABLE features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  description text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE client_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  feature_id uuid NOT NULL REFERENCES features(id),
  is_enabled boolean DEFAULT true,
  enabled_at timestamptz DEFAULT now(),
  disabled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- LEADS / CRM
-- ============================================

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  name text NOT NULL,
  phone text NOT NULL,
  source text NOT NULL,
  stage text NOT NULL,
  is_qualified boolean DEFAULT false,
  converted boolean DEFAULT false,
  conversion_value numeric,
  product_service text,
  agent_name text,
  objections text[],
  interests text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE chats (
  id bigserial PRIMARY KEY,
  client_id uuid REFERENCES clients(id),
  phone text,
  nome text,
  etapa_fu text,
  tags text,
  canal text DEFAULT 'whatsapp',
  conversation_id text,
  "ID_CW" bigint,
  "Agente" text,
  id_kanban text,
  kanban_data jsonb,
  created_at timestamptz,
  updated_at text
);

CREATE TABLE funnel_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  stage_name text NOT NULL,
  stage_order integer NOT NULL,
  is_qualified boolean DEFAULT false,
  is_conversion boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- VENDAS / PRODUTOS
-- ============================================

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  product_name text NOT NULL,
  price numeric NOT NULL,
  cost numeric,
  margin numeric,
  size text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  lead_id uuid REFERENCES leads(id),
  chat_id bigint REFERENCES chats(id),
  customer_name text NOT NULL,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric NOT NULL,
  total numeric NOT NULL,
  payment_method text,
  sale_date timestamptz DEFAULT now(),
  kanban_deal_id text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- DASHBOARD / METRICAS
-- ============================================

CREATE TABLE dashboard_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  metric_date date NOT NULL,
  date date DEFAULT CURRENT_DATE,
  total_leads integer DEFAULT 0,
  qualified_leads integer DEFAULT 0,
  contacts_count integer DEFAULT 0,
  appointments_count integer DEFAULT 0,
  attendance_count integer DEFAULT 0,
  conversions_count integer DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  contact_to_appointment_rate numeric DEFAULT 0,
  appointment_to_attendance_rate numeric DEFAULT 0,
  attendance_to_conversion_rate numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  revenue_vs_goal numeric DEFAULT 0,
  remaining_to_goal numeric DEFAULT 0,
  average_ticket numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- TRAFEGO / META ADS
-- ============================================

CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  campaign_id text NOT NULL,                       -- Meta campaign ID
  campaign_name text NOT NULL,
  objective text NOT NULL DEFAULT 'CONVERSIONS',   -- OUTCOME_TRAFFIC | OUTCOME_LEADS | OUTCOME_SALES | OUTCOME_ENGAGEMENT | OUTCOME_AWARENESS | LINK_CLICKS | CONVERSIONS
  status text NOT NULL DEFAULT 'ACTIVE',           -- ACTIVE | PAUSED | ARCHIVED | DELETED
  spend numeric NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  purchases integer NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  leads integer NOT NULL DEFAULT 0,
  cpm numeric NOT NULL DEFAULT 0,
  cpc numeric NOT NULL DEFAULT 0,
  ctr numeric NOT NULL DEFAULT 0,
  roas numeric NOT NULL DEFAULT 0,
  link_clicks integer NOT NULL DEFAULT 0,
  video_views integer NOT NULL DEFAULT 0,
  engagement integer NOT NULL DEFAULT 0,
  messaging_replies integer NOT NULL DEFAULT 0,
  cost_per_result numeric NOT NULL DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE creatives_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  creative_id text NOT NULL,                       -- Meta ad ID
  creative_name text NOT NULL,
  campaign_id text,                                -- FK logica para campaigns.campaign_id
  ad_set_name text,
  spend numeric NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  purchases integer NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  roas numeric NOT NULL DEFAULT 0,
  ctr numeric NOT NULL DEFAULT 0,
  cpc numeric NOT NULL DEFAULT 0,
  classification text NOT NULL DEFAULT 'neutral',  -- winner | positive | neutral | negative | fatigue
  thumbnail_url text,                              -- URL permanente no B2
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE chatwoot_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  conversations_count integer DEFAULT 0,
  open_conversations_count integer DEFAULT 0,
  outgoing_messages_count integer DEFAULT 0,
  incoming_messages_count integer DEFAULT 0,
  avg_first_response_time numeric,
  avg_resolution_time numeric,
  synced_at timestamptz DEFAULT now()
);

-- ============================================
-- CONTEUDO / CRIATIVOS
-- ============================================

CREATE TABLE content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'image',      -- image | video | carousel | story | reel
  caption text,
  media_url text,                                  -- URL da midia (imagem ou video)
  thumbnail_url text,
  platform text NOT NULL DEFAULT 'instagram',      -- instagram | facebook | tiktok | linkedin
  status text NOT NULL DEFAULT 'draft',            -- draft | review | approved | published
  scheduled_date date,
  published_at timestamptz,
  approved_at timestamptz,
  approved_by uuid,
  notes text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- KANBAN (SMF-OS)
-- ============================================

CREATE TABLE hub_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT '📋',
  color text DEFAULT '#3b82f6',
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE hub_board_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES hub_boards(id),
  status_key text NOT NULL,
  label text NOT NULL,
  icon text DEFAULT '📥',
  color text DEFAULT '#6b7280',
  display_order integer DEFAULT 0,
  wip_limit integer,
  is_done_column boolean DEFAULT false,
  process_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE hub_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  board_id uuid REFERENCES hub_boards(id),
  title text NOT NULL,
  description text,
  status task_status DEFAULT 'backlog',
  custom_status text,
  priority task_priority DEFAULT 'P3',
  context task_context,
  tags text[],
  due_date date,
  estimated_minutes integer,
  deal_value numeric,
  contact_phone text,
  client_id uuid,
  assigned_to uuid,
  team_id uuid,
  collaborator_id uuid,
  collaborator_ids uuid[] DEFAULT '{}',
  checklist jsonb DEFAULT '[]',
  display_order integer DEFAULT 0,
  total_time_seconds integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- FUNCOES RPC
-- ============================================

-- Bulk update de thumbnails de criativos (bypassa RLS)
CREATE OR REPLACE FUNCTION update_creative_thumbnails(p_client_id uuid, p_data jsonb)
RETURNS integer AS $$
DECLARE
  rec record;
  cnt integer := 0;
BEGIN
  FOR rec IN SELECT * FROM jsonb_each_text(p_data)
  LOOP
    UPDATE creatives_performance
    SET thumbnail_url = rec.value
    WHERE creative_id = rec.key AND client_id = p_client_id;
    cnt := cnt + 1;
  END LOOP;
  RETURN cnt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
