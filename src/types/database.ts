export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_mappings: {
        Row: {
          ad_group_name: string | null
          audience_type: string | null
          campaign_name: string
          client_id: string
          created_at: string | null
          creative_name: string | null
          id: string
          notes: string | null
          source_id: string
          updated_at: string | null
        }
        Insert: {
          ad_group_name?: string | null
          audience_type?: string | null
          campaign_name: string
          client_id: string
          created_at?: string | null
          creative_name?: string | null
          id?: string
          notes?: string | null
          source_id: string
          updated_at?: string | null
        }
        Update: {
          ad_group_name?: string | null
          audience_type?: string | null
          campaign_name?: string
          client_id?: string
          created_at?: string | null
          creative_name?: string | null
          id?: string
          notes?: string | null
          source_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_mappings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      ai_context_cache: {
        Row: {
          client_id: string
          context_data: Json
          context_text: string
          expires_at: string
          generated_at: string | null
          id: string
          recent_conversations: Json | null
          total_conversations: number | null
        }
        Insert: {
          client_id: string
          context_data: Json
          context_text: string
          expires_at: string
          generated_at?: string | null
          id?: string
          recent_conversations?: Json | null
          total_conversations?: number | null
        }
        Update: {
          client_id?: string
          context_data?: Json
          context_text?: string
          expires_at?: string
          generated_at?: string | null
          id?: string
          recent_conversations?: Json | null
          total_conversations?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_context_cache_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          action_items: string[] | null
          client_id: string
          created_at: string | null
          data: Json | null
          description: string
          dismissed: boolean | null
          id: string
          is_read: boolean | null
          period_end: string | null
          period_start: string | null
          priority: string
          supporting_data: Json | null
          title: string
          type: string
        }
        Insert: {
          action_items?: string[] | null
          client_id: string
          created_at?: string | null
          data?: Json | null
          description: string
          dismissed?: boolean | null
          id?: string
          is_read?: boolean | null
          period_end?: string | null
          period_start?: string | null
          priority: string
          supporting_data?: Json | null
          title: string
          type: string
        }
        Update: {
          action_items?: string[] | null
          client_id?: string
          created_at?: string | null
          data?: Json | null
          description?: string
          dismissed?: boolean | null
          id?: string
          is_read?: boolean | null
          period_end?: string | null
          period_start?: string | null
          priority?: string
          supporting_data?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_conversations: {
        Row: {
          client_id: string
          content: string
          context_data: Json | null
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          client_id: string
          content: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          client_id?: string
          content?: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          Agente: string | null
          client_id: string | null
          conversation_id: string | null
          created_at: string | null
          etapa_fu: string | null
          id: number
          ID_CW: number | null
          id_kanban: string | null
          nome: string | null
          phone: string | null
          tags: string | null
          updated_at: string | null
        }
        Insert: {
          Agente?: string | null
          client_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          etapa_fu?: string | null
          id: number
          ID_CW?: number | null
          id_kanban?: string | null
          nome?: string | null
          phone?: string | null
          tags?: string | null
          updated_at?: string | null
        }
        Update: {
          Agente?: string | null
          client_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          etapa_fu?: string | null
          id?: number
          ID_CW?: number | null
          id_kanban?: string | null
          nome?: string | null
          phone?: string | null
          tags?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      chatwoot_metrics: {
        Row: {
          avg_first_response_time: number | null
          avg_resolution_time: number | null
          client_id: string
          conversations_count: number | null
          created_at: string | null
          id: string
          incoming_messages_count: number | null
          open_conversations_count: number | null
          outgoing_messages_count: number | null
          synced_at: string | null
        }
        Insert: {
          avg_first_response_time?: number | null
          avg_resolution_time?: number | null
          client_id: string
          conversations_count?: number | null
          created_at?: string | null
          id?: string
          incoming_messages_count?: number | null
          open_conversations_count?: number | null
          outgoing_messages_count?: number | null
          synced_at?: string | null
        }
        Update: {
          avg_first_response_time?: number | null
          avg_resolution_time?: number | null
          client_id?: string
          conversations_count?: number | null
          created_at?: string | null
          id?: string
          incoming_messages_count?: number | null
          open_conversations_count?: number | null
          outgoing_messages_count?: number | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatwoot_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_features: {
        Row: {
          client_id: string
          created_at: string | null
          disabled_at: string | null
          enabled_at: string | null
          feature_id: string
          id: string
          is_enabled: boolean | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          feature_id: string
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          feature_id?: string
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_features_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          auth_user_id: string | null
          average_ticket: number | null
          business_context: string | null
          business_name: string
          business_niche: string
          client_type: string | null
          created_at: string | null
          cw_account_id: string | null
          cw_api_token: string | null
          cw_base_url: string | null
          cw_enabled: boolean | null
          cw_last_sync_at: string | null
          dashboard_configured: boolean | null
          email: string
          id: string
          is_active: boolean | null
          kanban_api_token: string | null
          kanban_api_url: string | null
          meta_ads_account_id: string | null
          monthly_revenue_goal: number | null
          qualified_criteria: string | null
          updated_at: string | null
          agent_whatsapp_id: number | null
          agent_instagram_id: number | null
          agents_supabase_ref: string | null
        }
        Insert: {
          auth_user_id?: string | null
          average_ticket?: number | null
          business_context?: string | null
          business_name: string
          business_niche: string
          client_type?: string | null
          created_at?: string | null
          cw_account_id?: string | null
          cw_api_token?: string | null
          cw_base_url?: string | null
          cw_enabled?: boolean | null
          cw_last_sync_at?: string | null
          dashboard_configured?: boolean | null
          email: string
          id?: string
          is_active?: boolean | null
          kanban_api_token?: string | null
          kanban_api_url?: string | null
          meta_ads_account_id?: string | null
          monthly_revenue_goal?: number | null
          qualified_criteria?: string | null
          updated_at?: string | null
          agent_whatsapp_id?: number | null
          agent_instagram_id?: number | null
          agents_supabase_ref?: string | null
        }
        Update: {
          auth_user_id?: string | null
          average_ticket?: number | null
          business_context?: string | null
          business_name?: string
          business_niche?: string
          client_type?: string | null
          created_at?: string | null
          cw_account_id?: string | null
          cw_api_token?: string | null
          cw_base_url?: string | null
          cw_enabled?: boolean | null
          cw_last_sync_at?: string | null
          dashboard_configured?: boolean | null
          email?: string
          id?: string
          is_active?: boolean | null
          kanban_api_token?: string | null
          kanban_api_url?: string | null
          meta_ads_account_id?: string | null
          monthly_revenue_goal?: number | null
          qualified_criteria?: string | null
          updated_at?: string | null
          agent_whatsapp_id?: number | null
          agent_instagram_id?: number | null
          agents_supabase_ref?: string | null
        }
        Relationships: []
      }
      conversations_analysis: {
        Row: {
          analyzed_at: string | null
          client_id: string
          conversation_text: string
          extracted_interests: string[] | null
          extracted_objections: string[] | null
          id: string
          lead_id: string | null
          qualification_score: number | null
          sentiment_score: number | null
        }
        Insert: {
          analyzed_at?: string | null
          client_id: string
          conversation_text: string
          extracted_interests?: string[] | null
          extracted_objections?: string[] | null
          id?: string
          lead_id?: string | null
          qualification_score?: number | null
          sentiment_score?: number | null
        }
        Update: {
          analyzed_at?: string | null
          client_id?: string
          conversation_text?: string
          extracted_interests?: string[] | null
          extracted_objections?: string[] | null
          id?: string
          lead_id?: string | null
          qualification_score?: number | null
          sentiment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_analysis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_analysis_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_metrics: {
        Row: {
          appointment_to_attendance_rate: number | null
          appointments_count: number | null
          attendance_count: number | null
          attendance_to_conversion_rate: number | null
          average_ticket: number | null
          client_id: string
          contact_to_appointment_rate: number | null
          contacts_count: number | null
          conversion_rate: number | null
          conversions_count: number | null
          created_at: string | null
          date: string | null
          id: string
          metric_date: string
          qualified_leads: number | null
          remaining_to_goal: number | null
          revenue_vs_goal: number | null
          total_leads: number | null
          total_revenue: number | null
        }
        Insert: {
          appointment_to_attendance_rate?: number | null
          appointments_count?: number | null
          attendance_count?: number | null
          attendance_to_conversion_rate?: number | null
          average_ticket?: number | null
          client_id: string
          contact_to_appointment_rate?: number | null
          contacts_count?: number | null
          conversion_rate?: number | null
          conversions_count?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          metric_date: string
          qualified_leads?: number | null
          remaining_to_goal?: number | null
          revenue_vs_goal?: number | null
          total_leads?: number | null
          total_revenue?: number | null
        }
        Update: {
          appointment_to_attendance_rate?: number | null
          appointments_count?: number | null
          attendance_count?: number | null
          attendance_to_conversion_rate?: number | null
          average_ticket?: number | null
          client_id?: string
          contact_to_appointment_rate?: number | null
          contacts_count?: number | null
          conversion_rate?: number | null
          conversions_count?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          metric_date?: string
          qualified_leads?: number | null
          remaining_to_goal?: number | null
          revenue_vs_goal?: number | null
          total_leads?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          feature_key: string
          feature_name: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          feature_key: string
          feature_name: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      funnel_label_config: {
        Row: {
          client_id: string
          created_at: string | null
          display_order: number
          id: string
          label_name: string
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          display_order: number
          id?: string
          label_name: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          display_order?: number
          id?: string
          label_name?: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_label_config_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_stages: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          is_conversion: boolean | null
          is_qualified: boolean | null
          stage_name: string
          stage_order: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          is_conversion?: boolean | null
          is_qualified?: boolean | null
          stage_name: string
          stage_order: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          is_conversion?: boolean | null
          is_qualified?: boolean | null
          stage_name?: string
          stage_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "funnel_stages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          source_name: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          source_name: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          source_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agent_name: string | null
          client_id: string
          conversion_value: number | null
          converted: boolean | null
          created_at: string | null
          id: string
          interests: string[] | null
          is_qualified: boolean | null
          name: string
          notes: string | null
          objections: string[] | null
          phone: string
          product_service: string | null
          source: string
          stage: string
          updated_at: string | null
        }
        Insert: {
          agent_name?: string | null
          client_id: string
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          is_qualified?: boolean | null
          name: string
          notes?: string | null
          objections?: string[] | null
          phone: string
          product_service?: string | null
          source: string
          stage: string
          updated_at?: string | null
        }
        Update: {
          agent_name?: string | null
          client_id?: string
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          is_qualified?: boolean | null
          name?: string
          notes?: string | null
          objections?: string[] | null
          phone?: string
          product_service?: string | null
          source?: string
          stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          client_id: string
          cost: number | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          margin: number | null
          price: number
          product_name: string
          size: string | null
        }
        Insert: {
          client_id: string
          cost?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          margin?: number | null
          price: number
          product_name: string
          size?: string | null
        }
        Update: {
          client_id?: string
          cost?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          margin?: number | null
          price?: number
          product_name?: string
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          client_id: string
          created_at: string | null
          customer_name: string
          id: string
          notes: string | null
          product_name: string
          quantity: number | null
          sale_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          customer_name: string
          id?: string
          notes?: string | null
          product_name: string
          quantity?: number | null
          sale_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          customer_name?: string
          id?: string
          notes?: string | null
          product_name?: string
          quantity?: number | null
          sale_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          chat_id: number | null
          client_id: string
          created_at: string | null
          customer_name: string
          id: string
          kanban_deal_id: string | null
          lead_id: string | null
          payment_method: string | null
          product_id: string | null
          product_name: string
          quantity: number | null
          sale_date: string | null
          total: number
          unit_price: number
        }
        Insert: {
          chat_id?: number | null
          client_id: string
          created_at?: string | null
          customer_name: string
          id?: string
          kanban_deal_id?: string | null
          lead_id?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number | null
          sale_date?: string | null
          total: number
          unit_price: number
        }
        Update: {
          chat_id?: number | null
          client_id?: string
          created_at?: string | null
          customer_name?: string
          id?: string
          kanban_deal_id?: string | null
          lead_id?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number | null
          sale_date?: string | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      traffic_costs: {
        Row: {
          campaign_name: string | null
          clicks: number | null
          client_id: string
          created_at: string | null
          date: string
          id: string
          impressions: number | null
          leads_generated: number | null
          platform: string | null
          spend: number
        }
        Insert: {
          campaign_name?: string | null
          clicks?: number | null
          client_id: string
          created_at?: string | null
          date: string
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          platform?: string | null
          spend?: number
        }
        Update: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          created_at?: string | null
          date?: string
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          platform?: string | null
          spend?: number
        }
        Relationships: [
          {
            foreignKeyName: "traffic_costs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_features_view: {
        Row: {
          category: string | null
          client_id: string | null
          description: string | null
          feature_key: string | null
          feature_name: string | null
          is_enabled: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_features_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_threads: {
        Row: {
          client_id: string | null
          client_name: string | null
          conversation_id: string | null
          first_user_message: string | null
          last_message_at: string | null
          message_count: number | null
          started_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_approvals_view: {
        Row: {
          approval_id: string | null
          approval_type: string | null
          client_id: string | null
          client_name: string | null
          execution_id: string | null
          execution_title: string | null
          pop_title: string | null
          process_type: string | null
          request_notes: string | null
          requested_at: string | null
          requested_from: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_executions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_proposal_contract: {
        Args: { p_accepted_by: string; p_proposal_id: string }
        Returns: undefined
      }
      accept_team_invite: { Args: { p_token: string }; Returns: boolean }
      calculate_client_ltv: { Args: { p_client_id: string }; Returns: number }
      calculate_client_tenure: { Args: { p_client_id: string }; Returns: Json }
      calculate_quarter_from_date: { Args: { p_date: string }; Returns: string }
      calculate_ticket_deadline: {
        Args: { p_opened_at: string; p_priority: string }
        Returns: string
      }
      check_overdue_tasks: { Args: never; Returns: undefined }
      check_task_reminders: { Args: never; Returns: undefined }
      check_upcoming_tasks: { Args: never; Returns: undefined }
      check_user_is_admin: { Args: { p_user_id: string }; Returns: boolean }
      check_user_role: { Args: never; Returns: Json }
      client_has_feature: {
        Args: { p_client_id: string; p_feature_key: string }
        Returns: boolean
      }
      complete_execution_step: {
        Args: {
          p_checklist_item_id: string
          p_evidence_type?: string
          p_evidence_url?: string
          p_execution_id: string
          p_notes?: string
          p_result?: string
          p_time_spent?: number
        }
        Returns: boolean
      }
      complete_process_execution: {
        Args: {
          p_execution_id: string
          p_result?: string
          p_result_notes?: string
        }
        Returns: boolean
      }
      create_default_board_for_user: {
        Args: { p_user_id: string }
        Returns: string
      }
      create_proposal_zapsign_contract: {
        Args: {
          p_doc_token: string
          p_proposal_id: string
          p_sign_url: string
          p_signer_token: string
        }
        Returns: undefined
      }
      create_public_ticket: {
        Args: {
          p_client_email: string
          p_conversation_link?: string
          p_description: string
          p_priority?: string
          p_subject: string
          p_ticket_type: string
          p_user_id: string
        }
        Returns: Json
      }
      decide_execution_approval: {
        Args: {
          p_approval_id: string
          p_decision: string
          p_notes?: string
          p_revision_items?: Json
        }
        Returns: boolean
      }
      ensure_owner_collaborator: {
        Args: { p_user_id: string }
        Returns: string
      }
      expire_old_proposals: { Args: never; Returns: number }
      generate_contract_from_template: {
        Args: { p_proposal_id: string; p_template_id: string }
        Returns: string
      }
      generate_proposal_number: { Args: { p_user_id: string }; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      get_ai_coach_context: { Args: { p_user_id: string }; Returns: Json }
      get_client_content_by_slug: {
        Args: { p_slug: string }
        Returns: {
          caption: string
          carousel_files: Json
          client_name: string
          content_type: string
          copy_body: string
          created_at: string
          day_of_week: string
          file_url: string
          hashtags: string
          hook: string
          id: string
          status: string
          theme: string
          visual_suggestion: string
          week_start_date: string
        }[]
      }
      get_client_financial_summary: {
        Args: { p_client_id: string }
        Returns: Json
      }
      get_client_id_from_auth: { Args: never; Returns: string }
      get_client_interactions: {
        Args: { p_client_id: string; p_limit?: number }
        Returns: {
          created_at: string
          created_by_name: string
          description: string
          id: string
          interaction_type: string
          next_action: string
          next_action_date: string
          outcome: string
          title: string
        }[]
      }
      get_client_proposals: {
        Args: { p_client_id: string }
        Returns: {
          asaas_billing_type: string | null
          asaas_payment_id: string | null
          client_id: string | null
          cnpj: string | null
          company_data: Json | null
          contract_accepted_at: string | null
          contract_accepted_by: string | null
          contract_content: string | null
          contract_document_url: string | null
          contract_template_id: string | null
          created_at: string | null
          custom_terms: string | null
          delivery_time: string | null
          description: string | null
          discount_percent: number | null
          discount_value: number | null
          follow_up_notes: string | null
          id: string
          is_custom_negotiation: boolean | null
          items: Json | null
          lead_company: string | null
          lead_contact: string | null
          lead_email: string | null
          lead_name: string
          lead_phone: string | null
          lead_source: string | null
          legal_representative: string | null
          legal_representative_cpf: string | null
          lost_at: string | null
          lost_reason: string | null
          next_follow_up: string | null
          notes: string | null
          payment_link: string | null
          payment_link_expires_at: string | null
          payment_method: string | null
          payment_status: string | null
          payment_terms: string | null
          plan_id: string | null
          probability: number | null
          proposal_number: string
          proposal_type: string | null
          recurring_value: number | null
          sent_at: string | null
          status: string | null
          subtotal: number | null
          tags: string[] | null
          title: string
          total_value: number | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
          validity_days: number | null
          viewed_at: string | null
          won_at: string | null
          zapsign_doc_status: string | null
          zapsign_doc_token: string | null
          zapsign_sign_url: string | null
          zapsign_signed_at: string | null
          zapsign_signed_file_url: string | null
          zapsign_signer_token: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "proposals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_client_task_counts: {
        Args: { p_client_id: string; p_user_id: string }
        Returns: {
          active: number
          completed: number
          overdue: number
          total: number
        }[]
      }
      get_client_tasks: {
        Args: { p_client_id: string; p_limit?: number; p_user_id: string }
        Returns: {
          board_id: string
          board_title: string
          completed_at: string
          created_at: string
          custom_status: string
          deal_value: number
          description: string
          due_date: string
          id: string
          priority: string
          status: string
          title: string
        }[]
      }
      get_collaborators: {
        Args: { p_user_id: string }
        Returns: {
          avatar_color: string
          email: string
          id: string
          is_active: boolean
          name: string
        }[]
      }
      get_commercial_metrics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_current_user_admin_info: {
        Args: never
        Returns: {
          email: string
          full_name: string
          is_admin: boolean
          is_super_admin: boolean
          role: string
          user_id: string
        }[]
      }
      get_current_user_email: { Args: never; Returns: string }
      get_execution_stats: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_mrr_evolution: {
        Args: { p_months?: number; p_user_id: string }
        Returns: Json
      }
      get_my_role: { Args: never; Returns: string }
      get_or_create_user_team: { Args: { p_user_id: string }; Returns: string }
      get_or_create_weekly_review: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_priority_tasks_for_briefing: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_proposals_metrics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_roadmap_stats: {
        Args: { p_user_id: string; p_year?: number }
        Returns: Json
      }
      get_team_members: {
        Args: { p_team_id: string }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          is_owner: boolean
          role: string
          user_id: string
        }[]
      }
      get_test_stats: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_ticket_stats: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_upcoming_roadmap_items: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          days_until: number
          id: string
          planned_date: string
          priority: string
          quarter: string
          status: string
          title: string
        }[]
      }
      get_user_display_name: { Args: { p_user_id: string }; Returns: string }
      get_user_features: {
        Args: { p_user_id: string }
        Returns: {
          category: string
          enabled: boolean
          feature_id: string
          name: string
        }[]
      }
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      get_user_team: {
        Args: { p_user_id: string }
        Returns: {
          is_owner: boolean
          team_id: string
          team_name: string
          user_role: string
        }[]
      }
      get_user_team_ids: { Args: { p_user_id: string }; Returns: string[] }
      get_week_start: { Args: { p_date?: string }; Returns: string }
      invite_team_member: {
        Args: { p_email: string; p_role?: string; p_team_id: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      mask_api_key: { Args: { api_key: string }; Returns: string }
      notify_overdue_tasks: { Args: never; Returns: undefined }
      notify_tasks_due_today: { Args: never; Returns: undefined }
      notify_tasks_due_tomorrow: { Args: never; Returns: undefined }
      record_plan_change: {
        Args: {
          p_client_id: string
          p_new_mrr: number
          p_new_plan_id: string
          p_reason?: string
        }
        Returns: string
      }
      request_execution_approval: {
        Args: {
          p_approval_type?: string
          p_execution_id: string
          p_notes?: string
          p_requested_from?: string
        }
        Returns: string
      }
      run_task_notifications: { Args: never; Returns: undefined }
      set_user_feature: {
        Args: { p_enabled: boolean; p_feature_id: string; p_user_id: string }
        Returns: undefined
      }
      start_process_execution: {
        Args: {
          p_client_id?: string
          p_due_date?: string
          p_pop_id: string
          p_priority?: string
          p_title?: string
          p_user_id: string
        }
        Returns: string
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_proposal_payment: {
        Args: {
          p_asaas_payment_id: string
          p_billing_type?: string
          p_payment_link: string
          p_proposal_id: string
        }
        Returns: undefined
      }
      update_proposal_zapsign_status: {
        Args: {
          p_doc_token: string
          p_signed_at?: string
          p_signed_file_url?: string
          p_status: string
        }
        Returns: string
      }
      user_has_feature: {
        Args: { p_feature_id: string; p_user_id: string }
        Returns: boolean
      }
      validate_client_email: {
        Args: { p_email: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      asset_type: "png" | "pdf" | "html" | "json" | "zip"
      energy_level: "alta" | "media" | "baixa"
      expense_category:
        | "infraestrutura"
        | "software"
        | "pessoal"
        | "impostos"
        | "marketing"
        | "educacao"
        | "equipamento"
        | "seguros"
        | "outros"
      expense_type: "PF" | "PJ"
      financial_transaction_type:
        | "receita_bruta"
        | "deducao_receita"
        | "custo_servico"
        | "despesa_operacional"
        | "despesa_financeira"
        | "receita_financeira"
        | "imposto_renda"
        | "pro_labore"
        | "investimento"
        | "emprestimo"
        | "outro"
      habit_frequency: "daily" | "weekly" | "monthly"
      job_status: "queued" | "processing" | "completed" | "failed" | "canceled"
      job_type: "carrossel" | "copy" | "roteiro" | "estrategia"
      notification_type:
        | "task_reminder"
        | "task_overdue"
        | "habit_reminder"
        | "checkin_reminder"
        | "system"
        | "achievement"
      recurrence_type: "once" | "monthly" | "quarterly" | "yearly"
      task_context: "engenheiro" | "vendedor" | "criador" | "aprendiz"
      task_priority: "P1" | "P2" | "P3" | "P4"
      task_status:
        | "backlog"
        | "na_fila"
        | "sprint"
        | "aguardando"
        | "concluido"
        | "someday_maybe"
      week_cycle: "A" | "B" | "Both"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      asset_type: ["png", "pdf", "html", "json", "zip"],
      energy_level: ["alta", "media", "baixa"],
      expense_category: [
        "infraestrutura",
        "software",
        "pessoal",
        "impostos",
        "marketing",
        "educacao",
        "equipamento",
        "seguros",
        "outros",
      ],
      expense_type: ["PF", "PJ"],
      financial_transaction_type: [
        "receita_bruta",
        "deducao_receita",
        "custo_servico",
        "despesa_operacional",
        "despesa_financeira",
        "receita_financeira",
        "imposto_renda",
        "pro_labore",
        "investimento",
        "emprestimo",
        "outro",
      ],
      habit_frequency: ["daily", "weekly", "monthly"],
      job_status: ["queued", "processing", "completed", "failed", "canceled"],
      job_type: ["carrossel", "copy", "roteiro", "estrategia"],
      notification_type: [
        "task_reminder",
        "task_overdue",
        "habit_reminder",
        "checkin_reminder",
        "system",
        "achievement",
      ],
      recurrence_type: ["once", "monthly", "quarterly", "yearly"],
      task_context: ["engenheiro", "vendedor", "criador", "aprendiz"],
      task_priority: ["P1", "P2", "P3", "P4"],
      task_status: [
        "backlog",
        "na_fila",
        "sprint",
        "aguardando",
        "concluido",
        "someday_maybe",
      ],
      week_cycle: ["A", "B", "Both"],
    },
  },
} as const