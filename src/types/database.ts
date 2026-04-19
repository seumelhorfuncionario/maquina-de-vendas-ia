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
      accountability_settings: {
        Row: {
          auto_send_time: string | null
          created_at: string | null
          id: string
          include_images_in_webhook: boolean | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          auto_send_time?: string | null
          created_at?: string | null
          id?: string
          include_images_in_webhook?: boolean | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          auto_send_time?: string | null
          created_at?: string | null
          id?: string
          include_images_in_webhook?: boolean | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
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
      ad_suggestions: {
        Row: {
          ad_copy: string | null
          audience_config: Json | null
          client_id: string
          created_at: string | null
          data_support: Json | null
          description: string
          id: string
          reasoning: string | null
          suggestion_type: string
          title: string
        }
        Insert: {
          ad_copy?: string | null
          audience_config?: Json | null
          client_id: string
          created_at?: string | null
          data_support?: Json | null
          description: string
          id?: string
          reasoning?: string | null
          suggestion_type: string
          title: string
        }
        Update: {
          ad_copy?: string | null
          audience_config?: Json | null
          client_id?: string
          created_at?: string | null
          data_support?: Json | null
          description?: string
          id?: string
          reasoning?: string | null
          suggestion_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_suggestions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
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
      ai_coach_sessions: {
        Row: {
          ai_response: string | null
          context_data: Json | null
          created_at: string | null
          id: string
          session_type: string
          suggestions: Json | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          context_data?: Json | null
          created_at?: string | null
          id?: string
          session_type: string
          suggestions?: Json | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          ai_response?: string | null
          context_data?: Json | null
          created_at?: string | null
          id?: string
          session_type?: string
          suggestions?: Json | null
          user_feedback?: string | null
          user_id?: string
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
      asaas_accounts: {
        Row: {
          account_name: string
          api_key: string
          created_at: string | null
          environment: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
          webhook_secret: string | null
        }
        Insert: {
          account_name: string
          api_key: string
          created_at?: string | null
          environment?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
          webhook_secret?: string | null
        }
        Update: {
          account_name?: string
          api_key?: string
          created_at?: string | null
          environment?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      asaas_config: {
        Row: {
          api_key: string
          created_at: string | null
          environment: string
          id: string
          updated_at: string | null
          user_id: string
          webhook_token: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          environment?: string
          id?: string
          updated_at?: string | null
          user_id: string
          webhook_token?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          environment?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          webhook_token?: string | null
        }
        Relationships: []
      }
      asaas_customers: {
        Row: {
          address: string | null
          address_number: string | null
          asaas_id: string
          complement: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          external_reference: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          address_number?: string | null
          asaas_id: string
          complement?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          external_reference?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          address_number?: string | null
          asaas_id?: string
          complement?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          external_reference?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asaas_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          payment_id: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          payment_id?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          payment_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asaas_notifications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "asaas_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      asaas_payments: {
        Row: {
          asaas_account_id: string | null
          asaas_customer_id: string | null
          asaas_id: string
          bank_slip_url: string | null
          billing_type: string
          client_payment_date: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          due_date: string
          external_reference: string | null
          id: string
          installment_count: number | null
          installment_number: number | null
          invoice_url: string | null
          net_value: number | null
          notified_overdue: boolean | null
          notified_paid: boolean | null
          original_due_date: string | null
          payment_date: string | null
          pix_expiration_date: string | null
          pix_qrcode_image: string | null
          pix_qrcode_payload: string | null
          status: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          asaas_account_id?: string | null
          asaas_customer_id?: string | null
          asaas_id: string
          bank_slip_url?: string | null
          billing_type: string
          client_payment_date?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_date: string
          external_reference?: string | null
          id?: string
          installment_count?: number | null
          installment_number?: number | null
          invoice_url?: string | null
          net_value?: number | null
          notified_overdue?: boolean | null
          notified_paid?: boolean | null
          original_due_date?: string | null
          payment_date?: string | null
          pix_expiration_date?: string | null
          pix_qrcode_image?: string | null
          pix_qrcode_payload?: string | null
          status: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          asaas_account_id?: string | null
          asaas_customer_id?: string | null
          asaas_id?: string
          bank_slip_url?: string | null
          billing_type?: string
          client_payment_date?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string
          external_reference?: string | null
          id?: string
          installment_count?: number | null
          installment_number?: number | null
          invoice_url?: string | null
          net_value?: number | null
          notified_overdue?: boolean | null
          notified_paid?: boolean | null
          original_due_date?: string | null
          payment_date?: string | null
          pix_expiration_date?: string | null
          pix_qrcode_image?: string | null
          pix_qrcode_payload?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "asaas_payments_asaas_account_id_fkey"
            columns: ["asaas_account_id"]
            isOneToOne: false
            referencedRelation: "asaas_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asaas_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "asaas_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      asaas_webhooks: {
        Row: {
          error: string | null
          event: string
          id: string
          payload: Json
          payment_asaas_id: string | null
          processed: boolean | null
          received_at: string | null
          user_id: string | null
        }
        Insert: {
          error?: string | null
          event: string
          id?: string
          payload: Json
          payment_asaas_id?: string | null
          processed?: boolean | null
          received_at?: string | null
          user_id?: string | null
        }
        Update: {
          error?: string | null
          event?: string
          id?: string
          payload?: Json
          payment_asaas_id?: string | null
          processed?: boolean | null
          received_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      bank_statements: {
        Row: {
          balance: number | null
          bank: string
          categories_summary: Json | null
          collaborator_id: string | null
          created_at: string | null
          id: string
          name: string
          period_end: string | null
          period_start: string | null
          total_credits: number | null
          total_debits: number | null
          transaction_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          bank: string
          categories_summary?: Json | null
          collaborator_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          period_end?: string | null
          period_start?: string | null
          total_credits?: number | null
          total_debits?: number | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          bank?: string
          categories_summary?: Json | null
          collaborator_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          period_end?: string | null
          period_start?: string | null
          total_credits?: number | null
          total_debits?: number | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          ai_categorized: boolean | null
          category: string | null
          created_at: string | null
          date: string
          description: string
          expense_type: string | null
          id: string
          notes: string | null
          statement_id: string
          type: string
          user_id: string
          value: number
        }
        Insert: {
          ai_categorized?: boolean | null
          category?: string | null
          created_at?: string | null
          date: string
          description: string
          expense_type?: string | null
          id?: string
          notes?: string | null
          statement_id: string
          type: string
          user_id: string
          value: number
        }
        Update: {
          ai_categorized?: boolean | null
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string
          expense_type?: string | null
          id?: string
          notes?: string | null
          statement_id?: string
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          campaign_id: string
          campaign_name: string
          clicks: number
          client_id: string
          cost_per_result: number
          cpc: number
          cpm: number
          created_at: string | null
          ctr: number
          date: string
          engagement: number
          id: string
          impressions: number
          leads: number
          link_clicks: number
          messaging_replies: number
          objective: string
          purchases: number
          revenue: number
          roas: number
          spend: number
          status: string
          updated_at: string | null
          video_views: number
        }
        Insert: {
          campaign_id: string
          campaign_name: string
          clicks?: number
          client_id: string
          cost_per_result?: number
          cpc?: number
          cpm?: number
          created_at?: string | null
          ctr?: number
          date: string
          engagement?: number
          id?: string
          impressions?: number
          leads?: number
          link_clicks?: number
          messaging_replies?: number
          objective?: string
          purchases?: number
          revenue?: number
          roas?: number
          spend?: number
          status?: string
          updated_at?: string | null
          video_views?: number
        }
        Update: {
          campaign_id?: string
          campaign_name?: string
          clicks?: number
          client_id?: string
          cost_per_result?: number
          cpc?: number
          cpm?: number
          created_at?: string | null
          ctr?: number
          date?: string
          engagement?: number
          id?: string
          impressions?: number
          leads?: number
          link_clicks?: number
          messaging_replies?: number
          objective?: string
          purchases?: number
          revenue?: number
          roas?: number
          spend?: number
          status?: string
          updated_at?: string | null
          video_views?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      categorization_rules: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          expense_type: string
          id: string
          merchant_pattern: string
          source: string
          times_applied: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          expense_type: string
          id?: string
          merchant_pattern: string
          source: string
          times_applied?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          expense_type?: string
          id?: string
          merchant_pattern?: string
          source?: string
          times_applied?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          Agente: string | null
          canal: string | null
          client_id: string | null
          conversation_id: string | null
          created_at: string | null
          etapa_fu: string | null
          id: number
          ID_CW: number | null
          id_kanban: string | null
          kanban_data: Json | null
          nome: string | null
          phone: string | null
          tags: string | null
          updated_at: string | null
        }
        Insert: {
          Agente?: string | null
          canal?: string | null
          client_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          etapa_fu?: string | null
          id?: number
          ID_CW?: number | null
          id_kanban?: string | null
          kanban_data?: Json | null
          nome?: string | null
          phone?: string | null
          tags?: string | null
          updated_at?: string | null
        }
        Update: {
          Agente?: string | null
          canal?: string | null
          client_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          etapa_fu?: string | null
          id?: number
          ID_CW?: number | null
          id_kanban?: string | null
          kanban_data?: Json | null
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
      chatwoot_cache_full: {
        Row: {
          client_id: string
          conversations: Json
          created_at: string | null
          days: number
          expires_at: string
          id: string
          inboxes: Json
          labels: Json
          metrics: Json
        }
        Insert: {
          client_id: string
          conversations?: Json
          created_at?: string | null
          days?: number
          expires_at: string
          id?: string
          inboxes?: Json
          labels?: Json
          metrics: Json
        }
        Update: {
          client_id?: string
          conversations?: Json
          created_at?: string | null
          days?: number
          expires_at?: string
          id?: string
          inboxes?: Json
          labels?: Json
          metrics?: Json
        }
        Relationships: [
          {
            foreignKeyName: "chatwoot_cache_full_client_id_fkey"
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
      checklist_templates: {
        Row: {
          id: string
          items: Json
          stage_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          items?: Json
          stage_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          items?: Json
          stage_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_collaborators: {
        Row: {
          client_id: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_primary_contact: boolean | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_collaborators_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_content_posts: {
        Row: {
          caption: string | null
          carousel_files: Json | null
          content_type: string
          copy_body: string | null
          created_at: string | null
          day_of_week: string
          file_key: string | null
          file_name: string | null
          file_url: string | null
          hashtags: string | null
          hook: string | null
          hub_client_id: string
          id: string
          status: string | null
          theme: string
          updated_at: string | null
          user_id: string
          visual_suggestion: string | null
          week_start_date: string
        }
        Insert: {
          caption?: string | null
          carousel_files?: Json | null
          content_type: string
          copy_body?: string | null
          created_at?: string | null
          day_of_week: string
          file_key?: string | null
          file_name?: string | null
          file_url?: string | null
          hashtags?: string | null
          hook?: string | null
          hub_client_id: string
          id?: string
          status?: string | null
          theme: string
          updated_at?: string | null
          user_id: string
          visual_suggestion?: string | null
          week_start_date: string
        }
        Update: {
          caption?: string | null
          carousel_files?: Json | null
          content_type?: string
          copy_body?: string | null
          created_at?: string | null
          day_of_week?: string
          file_key?: string | null
          file_name?: string | null
          file_url?: string | null
          hashtags?: string | null
          hook?: string | null
          hub_client_id?: string
          id?: string
          status?: string | null
          theme?: string
          updated_at?: string | null
          user_id?: string
          visual_suggestion?: string | null
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_content_posts_hub_client_id_fkey"
            columns: ["hub_client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contracts: {
        Row: {
          attachment_notes: string | null
          client_id: string
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          observations: string | null
          title: string
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          attachment_notes?: string | null
          client_id: string
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          observations?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          attachment_notes?: string | null
          client_id?: string
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          observations?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_credentials: {
        Row: {
          api_key: string | null
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          password: string | null
          platform_name: string
          updated_at: string | null
          url: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          api_key?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          password?: string | null
          platform_name: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          api_key?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          password?: string | null
          platform_name?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_credentials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
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
      client_features_audit: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          changed_by_email: string | null
          client_id: string
          feature_id: string
          id: string
          new_enabled: boolean | null
          notes: string | null
          old_enabled: boolean | null
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          client_id: string
          feature_id: string
          id?: string
          new_enabled?: boolean | null
          notes?: string | null
          old_enabled?: boolean | null
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          client_id?: string
          feature_id?: string
          id?: string
          new_enabled?: boolean | null
          notes?: string | null
          old_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_features_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_features_audit_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      client_interactions: {
        Row: {
          client_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          interaction_type: string
          next_action: string | null
          next_action_date: string | null
          outcome: string | null
          related_proposal_id: string | null
          related_ticket_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          interaction_type: string
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          related_proposal_id?: string | null
          related_ticket_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          interaction_type?: string
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          related_proposal_id?: string | null
          related_ticket_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_interactions_related_proposal_id_fkey"
            columns: ["related_proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_interactions_related_ticket_id_fkey"
            columns: ["related_ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      client_plan_history: {
        Row: {
          change_type: string
          changed_at: string | null
          changed_by: string | null
          client_id: string
          id: string
          new_mrr: number | null
          new_plan_id: string | null
          previous_mrr: number | null
          previous_plan_id: string | null
          reason: string | null
        }
        Insert: {
          change_type: string
          changed_at?: string | null
          changed_by?: string | null
          client_id: string
          id?: string
          new_mrr?: number | null
          new_plan_id?: string | null
          previous_mrr?: number | null
          previous_plan_id?: string | null
          reason?: string | null
        }
        Update: {
          change_type?: string
          changed_at?: string | null
          changed_by?: string | null
          client_id?: string
          id?: string
          new_mrr?: number | null
          new_plan_id?: string | null
          previous_mrr?: number | null
          previous_plan_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_plan_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_plan_history_new_plan_id_fkey"
            columns: ["new_plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_plan_history_previous_plan_id_fkey"
            columns: ["previous_plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_prontuarios: {
        Row: {
          ai_generated_at: string | null
          client_temperature: string | null
          competitor_analysis: Json | null
          created_at: string | null
          current_state: string | null
          hub_client_id: string
          id: string
          improvement_points: string | null
          instagram_data: Json | null
          instagram_handle: string | null
          niche: string | null
          objections: string | null
          pain_points: string | null
          perspectives: string | null
          social_metrics: Json | null
          updated_at: string | null
          user_id: string
          value_assessment: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          client_temperature?: string | null
          competitor_analysis?: Json | null
          created_at?: string | null
          current_state?: string | null
          hub_client_id: string
          id?: string
          improvement_points?: string | null
          instagram_data?: Json | null
          instagram_handle?: string | null
          niche?: string | null
          objections?: string | null
          pain_points?: string | null
          perspectives?: string | null
          social_metrics?: Json | null
          updated_at?: string | null
          user_id: string
          value_assessment?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          client_temperature?: string | null
          competitor_analysis?: Json | null
          created_at?: string | null
          current_state?: string | null
          hub_client_id?: string
          id?: string
          improvement_points?: string | null
          instagram_data?: Json | null
          instagram_handle?: string | null
          niche?: string | null
          objections?: string | null
          pain_points?: string | null
          perspectives?: string | null
          social_metrics?: Json | null
          updated_at?: string | null
          user_id?: string
          value_assessment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_prontuarios_hub_client_id_fkey"
            columns: ["hub_client_id"]
            isOneToOne: true
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_agentes: {
        Row: {
          agente_id: number
          created_at: string | null
          hub_client_id: string
          id: string
        }
        Insert: {
          agente_id: number
          created_at?: string | null
          hub_client_id: string
          id?: string
        }
        Update: {
          agente_id?: number
          created_at?: string | null
          hub_client_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_agentes_hub_client_id_fkey"
            columns: ["hub_client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          agent_instagram_id: number | null
          agent_whatsapp_id: number | null
          agents_supabase_ref: string | null
          appointment_value: number | null
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
          dashboard_config: Json | null
          dashboard_configured: boolean | null
          email: string
          embed_token: string
          id: string
          is_active: boolean | null
          kanban_api_token: string | null
          kanban_api_url: string | null
          kanban_board_ids: string[] | null
          meta_ads_account_id: string | null
          monthly_revenue_goal: number | null
          qualified_criteria: string | null
          updated_at: string | null
        }
        Insert: {
          agent_instagram_id?: number | null
          agent_whatsapp_id?: number | null
          agents_supabase_ref?: string | null
          appointment_value?: number | null
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
          dashboard_config?: Json | null
          dashboard_configured?: boolean | null
          email: string
          embed_token?: string
          id?: string
          is_active?: boolean | null
          kanban_api_token?: string | null
          kanban_api_url?: string | null
          kanban_board_ids?: string[] | null
          meta_ads_account_id?: string | null
          monthly_revenue_goal?: number | null
          qualified_criteria?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_instagram_id?: number | null
          agent_whatsapp_id?: number | null
          agents_supabase_ref?: string | null
          appointment_value?: number | null
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
          dashboard_config?: Json | null
          dashboard_configured?: boolean | null
          email?: string
          embed_token?: string
          id?: string
          is_active?: boolean | null
          kanban_api_token?: string | null
          kanban_api_url?: string | null
          kanban_board_ids?: string[] | null
          meta_ads_account_id?: string | null
          monthly_revenue_goal?: number | null
          qualified_criteria?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          avatar_color: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_color?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_color?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_posts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          caption: string | null
          client_id: string
          content_type: string
          created_at: string | null
          id: string
          media_url: string | null
          notes: string | null
          platform: string
          published_at: string | null
          scheduled_date: string | null
          status: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          caption?: string | null
          client_id: string
          content_type?: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          notes?: string | null
          platform?: string
          published_at?: string | null
          scheduled_date?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          caption?: string | null
          client_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          notes?: string | null
          platform?: string
          published_at?: string | null
          scheduled_date?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          plan_id: string | null
          updated_at: string | null
          user_id: string
          variables: Json | null
          zapsign_template_token: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          plan_id?: string | null
          updated_at?: string | null
          user_id: string
          variables?: Json | null
          zapsign_template_token?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          plan_id?: string | null
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
          zapsign_template_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
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
      creatives_performance: {
        Row: {
          ad_set_name: string | null
          campaign_id: string | null
          classification: string
          clicks: number
          client_id: string
          cpc: number
          created_at: string | null
          creative_id: string
          creative_name: string
          ctr: number
          date: string
          id: string
          impressions: number
          purchases: number
          revenue: number
          roas: number
          spend: number
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          ad_set_name?: string | null
          campaign_id?: string | null
          classification?: string
          clicks?: number
          client_id: string
          cpc?: number
          created_at?: string | null
          creative_id: string
          creative_name: string
          ctr?: number
          date: string
          id?: string
          impressions?: number
          purchases?: number
          revenue?: number
          roas?: number
          spend?: number
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_set_name?: string | null
          campaign_id?: string | null
          classification?: string
          clicks?: number
          client_id?: string
          cpc?: number
          created_at?: string | null
          creative_id?: string
          creative_name?: string
          ctr?: number
          date?: string
          id?: string
          impressions?: number
          purchases?: number
          revenue?: number
          roas?: number
          spend?: number
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_performance_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_accountability: {
        Row: {
          book_notes: string | null
          book_title: string | null
          challenges: string | null
          created_at: string | null
          date: string
          diet_followed: boolean | null
          diet_notes: string | null
          exercise_done: boolean | null
          exercise_duration_minutes: number | null
          exercise_notes: string | null
          exercise_type: string | null
          general_notes: string | null
          id: string
          images: Json | null
          meditation_done: boolean | null
          meditation_minutes: number | null
          overall_score: number | null
          sent_at: string | null
          sent_to_webhook: boolean | null
          tomorrow_focus: string | null
          updated_at: string | null
          user_id: string
          wins: string | null
          writing_done: boolean | null
          writing_notes: string | null
          writing_topic: string | null
        }
        Insert: {
          book_notes?: string | null
          book_title?: string | null
          challenges?: string | null
          created_at?: string | null
          date?: string
          diet_followed?: boolean | null
          diet_notes?: string | null
          exercise_done?: boolean | null
          exercise_duration_minutes?: number | null
          exercise_notes?: string | null
          exercise_type?: string | null
          general_notes?: string | null
          id?: string
          images?: Json | null
          meditation_done?: boolean | null
          meditation_minutes?: number | null
          overall_score?: number | null
          sent_at?: string | null
          sent_to_webhook?: boolean | null
          tomorrow_focus?: string | null
          updated_at?: string | null
          user_id: string
          wins?: string | null
          writing_done?: boolean | null
          writing_notes?: string | null
          writing_topic?: string | null
        }
        Update: {
          book_notes?: string | null
          book_title?: string | null
          challenges?: string | null
          created_at?: string | null
          date?: string
          diet_followed?: boolean | null
          diet_notes?: string | null
          exercise_done?: boolean | null
          exercise_duration_minutes?: number | null
          exercise_notes?: string | null
          exercise_type?: string | null
          general_notes?: string | null
          id?: string
          images?: Json | null
          meditation_done?: boolean | null
          meditation_minutes?: number | null
          overall_score?: number | null
          sent_at?: string | null
          sent_to_webhook?: boolean | null
          tomorrow_focus?: string | null
          updated_at?: string | null
          user_id?: string
          wins?: string | null
          writing_done?: boolean | null
          writing_notes?: string | null
          writing_topic?: string | null
        }
        Relationships: []
      }
      daily_briefings: {
        Row: {
          briefing_content: string | null
          created_at: string | null
          date: string
          energy_context: Json | null
          id: string
          suggestions: Json | null
          tasks_summary: Json | null
          user_id: string
          was_viewed: boolean | null
        }
        Insert: {
          briefing_content?: string | null
          created_at?: string | null
          date: string
          energy_context?: Json | null
          id?: string
          suggestions?: Json | null
          tasks_summary?: Json | null
          user_id: string
          was_viewed?: boolean | null
        }
        Update: {
          briefing_content?: string | null
          created_at?: string | null
          date?: string
          energy_context?: Json | null
          id?: string
          suggestions?: Json | null
          tasks_summary?: Json | null
          user_id?: string
          was_viewed?: boolean | null
        }
        Relationships: []
      }
      daily_habit_logs: {
        Row: {
          completed: boolean | null
          date: string
          habit_id: string
          id: string
          logged_at: string | null
          notes: string | null
          source: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          completed?: boolean | null
          date?: string
          habit_id: string
          id?: string
          logged_at?: string | null
          notes?: string | null
          source?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          completed?: boolean | null
          date?: string
          habit_id?: string
          id?: string
          logged_at?: string | null
          notes?: string | null
          source?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "daily_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_habits: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          tracking_type: string
          tracking_unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          tracking_type?: string
          tracking_unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          tracking_type?: string
          tracking_unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_journal: {
        Row: {
          created_at: string | null
          date: string
          evening_challenges: string | null
          evening_completed_at: string | null
          evening_gratitude: string | null
          evening_lessons: string | null
          evening_notes: string | null
          evening_rating: number | null
          evening_wins: string | null
          id: string
          morning_completed_at: string | null
          morning_energy: number | null
          morning_focus: string | null
          morning_mood: string | null
          morning_notes: string | null
          tomorrow_completed_at: string | null
          tomorrow_notes: string | null
          tomorrow_top3: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          evening_challenges?: string | null
          evening_completed_at?: string | null
          evening_gratitude?: string | null
          evening_lessons?: string | null
          evening_notes?: string | null
          evening_rating?: number | null
          evening_wins?: string | null
          id?: string
          morning_completed_at?: string | null
          morning_energy?: number | null
          morning_focus?: string | null
          morning_mood?: string | null
          morning_notes?: string | null
          tomorrow_completed_at?: string | null
          tomorrow_notes?: string | null
          tomorrow_top3?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          evening_challenges?: string | null
          evening_completed_at?: string | null
          evening_gratitude?: string | null
          evening_lessons?: string | null
          evening_notes?: string | null
          evening_rating?: number | null
          evening_wins?: string | null
          id?: string
          morning_completed_at?: string | null
          morning_energy?: number | null
          morning_focus?: string | null
          morning_mood?: string | null
          morning_notes?: string | null
          tomorrow_completed_at?: string | null
          tomorrow_notes?: string | null
          tomorrow_top3?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_reflections: {
        Row: {
          created_at: string | null
          date: string
          id: string
          improvement_note: string | null
          score: number | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          improvement_note?: string | null
          score?: number | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          improvement_note?: string | null
          score?: number | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
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
      entregaveis_catalog: {
        Row: {
          ativo: boolean
          created_at: string
          display_order: number
          icon: string | null
          id: string
          label: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          label: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          label?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      execution_approvals: {
        Row: {
          approval_type: string
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          execution_id: string
          id: string
          request_notes: string | null
          requested_from: string | null
          revision_items: Json | null
          status: string
        }
        Insert: {
          approval_type?: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          execution_id: string
          id?: string
          request_notes?: string | null
          requested_from?: string | null
          revision_items?: Json | null
          status?: string
        }
        Update: {
          approval_type?: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          execution_id?: string
          id?: string
          request_notes?: string | null
          requested_from?: string | null
          revision_items?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_approvals_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_view"
            referencedColumns: ["execution_id"]
          },
          {
            foreignKeyName: "execution_approvals_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "process_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_steps: {
        Row: {
          checklist_item_id: string
          checklist_item_text: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          evidence_type: string | null
          evidence_url: string | null
          execution_id: string
          id: string
          is_required: boolean | null
          notes: string | null
          result: string | null
          status: string
          time_spent: number | null
        }
        Insert: {
          checklist_item_id: string
          checklist_item_text: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          evidence_type?: string | null
          evidence_url?: string | null
          execution_id: string
          id?: string
          is_required?: boolean | null
          notes?: string | null
          result?: string | null
          status?: string
          time_spent?: number | null
        }
        Update: {
          checklist_item_id?: string
          checklist_item_text?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          evidence_type?: string | null
          evidence_url?: string | null
          execution_id?: string
          id?: string
          is_required?: boolean | null
          notes?: string | null
          result?: string | null
          status?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_steps_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_view"
            referencedColumns: ["execution_id"]
          },
          {
            foreignKeyName: "execution_steps_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "process_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_definitions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
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
      finance_settings: {
        Row: {
          created_at: string | null
          emergency_fund_months: number | null
          id: string
          pro_labore: number | null
          target_margin: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emergency_fund_months?: number | null
          id?: string
          pro_labore?: number | null
          target_margin?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emergency_fund_months?: number | null
          id?: string
          pro_labore?: number | null
          target_margin?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_spreadsheet_cells: {
        Row: {
          created_at: string | null
          display_order: number | null
          due_day: number | null
          id: string
          reference_month: string
          row_key: string
          row_label: string
          row_type: string
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          due_day?: number | null
          id?: string
          reference_month: string
          row_key: string
          row_label: string
          row_type: string
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          due_day?: number | null
          id?: string
          reference_month?: string
          row_key?: string
          row_label?: string
          row_type?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      financial_alerts_log: {
        Row: {
          alert_type: string
          id: string
          message: string
          metadata: Json | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          id?: string
          message: string
          metadata?: Json | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          is_paid: boolean | null
          notes: string | null
          payment_date: string | null
          recurrence: Database["public"]["Enums"]["recurrence_type"] | null
          reference_date: string
          reference_month: string
          tags: string[] | null
          type: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          payment_date?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"] | null
          reference_date: string
          reference_month: string
          tags?: string[] | null
          type: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          payment_date?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"] | null
          reference_date?: string
          reference_month?: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string | null
          description: string
          display_order: number | null
          due_day: number | null
          expense_type: Database["public"]["Enums"]["expense_type"]
          id: string
          is_active: boolean | null
          notes: string | null
          quantity: number
          total_value: number | null
          unit: string | null
          unit_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          description: string
          display_order?: number | null
          due_day?: number | null
          expense_type?: Database["public"]["Enums"]["expense_type"]
          id?: string
          is_active?: boolean | null
          notes?: string | null
          quantity?: number
          total_value?: number | null
          unit?: string | null
          unit_value?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          description?: string
          display_order?: number | null
          due_day?: number | null
          expense_type?: Database["public"]["Enums"]["expense_type"]
          id?: string
          is_active?: boolean | null
          notes?: string | null
          quantity?: number
          total_value?: number | null
          unit?: string | null
          unit_value?: number
          updated_at?: string | null
          user_id?: string
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
      habit_logs: {
        Row: {
          completed_date: string
          created_at: string | null
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_date: string
          created_at?: string | null
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string | null
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          frequency: Database["public"]["Enums"]["habit_frequency"]
          icon: string | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          target_count: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          target_count?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          frequency?: Database["public"]["Enums"]["habit_frequency"]
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          target_count?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hub_ai_conversations: {
        Row: {
          content: string
          context_data: Json | null
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      hub_board_columns: {
        Row: {
          board_id: string
          color: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_done_column: boolean | null
          label: string
          process_id: string | null
          status_key: string
          updated_at: string | null
          wip_limit: number | null
        }
        Insert: {
          board_id: string
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_done_column?: boolean | null
          label: string
          process_id?: string | null
          status_key: string
          updated_at?: string | null
          wip_limit?: number | null
        }
        Update: {
          board_id?: string
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_done_column?: boolean | null
          label?: string
          process_id?: string | null
          status_key?: string
          updated_at?: string | null
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_board_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "hub_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_board_columns_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_boards: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hub_clients: {
        Row: {
          acquisition_source: string | null
          additional_data: string | null
          agents_info: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cnpj: string | null
          company_name: string
          contact_name: string | null
          contract_end_date: string | null
          created_at: string | null
          credentials: string | null
          delivery_stage: string | null
          drive_link: string | null
          email: string | null
          entregaveis_contratados: Json
          entry_date: string | null
          financial_status: string | null
          group_link: string | null
          health_score: string | null
          id: string
          implementation_paid: number | null
          last_billing_date: string | null
          last_interaction_at: string | null
          monthly_value: number | null
          mrr: number | null
          next_billing_date: string | null
          notes: string | null
          nps: number | null
          pipeline_order: number | null
          pipeline_stage: string | null
          plan_id: string | null
          plan_name: string | null
          portal_token: string | null
          public_access_enabled: boolean | null
          public_slug: string | null
          referred_by: string | null
          renewal_date: string | null
          responsible: string | null
          stage_checklist: Json | null
          stage_due_date: string | null
          stage_start_date: string | null
          stage_status: string | null
          stage_status_start_date: string | null
          start_date: string | null
          status: string | null
          tickets_info: string | null
          total_paid: number | null
          total_pending: number | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          acquisition_source?: string | null
          additional_data?: string | null
          agents_info?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cnpj?: string | null
          company_name: string
          contact_name?: string | null
          contract_end_date?: string | null
          created_at?: string | null
          credentials?: string | null
          delivery_stage?: string | null
          drive_link?: string | null
          email?: string | null
          entregaveis_contratados?: Json
          entry_date?: string | null
          financial_status?: string | null
          group_link?: string | null
          health_score?: string | null
          id?: string
          implementation_paid?: number | null
          last_billing_date?: string | null
          last_interaction_at?: string | null
          monthly_value?: number | null
          mrr?: number | null
          next_billing_date?: string | null
          notes?: string | null
          nps?: number | null
          pipeline_order?: number | null
          pipeline_stage?: string | null
          plan_id?: string | null
          plan_name?: string | null
          portal_token?: string | null
          public_access_enabled?: boolean | null
          public_slug?: string | null
          referred_by?: string | null
          renewal_date?: string | null
          responsible?: string | null
          stage_checklist?: Json | null
          stage_due_date?: string | null
          stage_start_date?: string | null
          stage_status?: string | null
          stage_status_start_date?: string | null
          start_date?: string | null
          status?: string | null
          tickets_info?: string | null
          total_paid?: number | null
          total_pending?: number | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          acquisition_source?: string | null
          additional_data?: string | null
          agents_info?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cnpj?: string | null
          company_name?: string
          contact_name?: string | null
          contract_end_date?: string | null
          created_at?: string | null
          credentials?: string | null
          delivery_stage?: string | null
          drive_link?: string | null
          email?: string | null
          entregaveis_contratados?: Json
          entry_date?: string | null
          financial_status?: string | null
          group_link?: string | null
          health_score?: string | null
          id?: string
          implementation_paid?: number | null
          last_billing_date?: string | null
          last_interaction_at?: string | null
          monthly_value?: number | null
          mrr?: number | null
          next_billing_date?: string | null
          notes?: string | null
          nps?: number | null
          pipeline_order?: number | null
          pipeline_stage?: string | null
          plan_id?: string | null
          plan_name?: string | null
          portal_token?: string | null
          public_access_enabled?: boolean | null
          public_slug?: string | null
          referred_by?: string | null
          renewal_date?: string | null
          responsible?: string | null
          stage_checklist?: Json | null
          stage_due_date?: string | null
          stage_start_date?: string | null
          stage_status?: string | null
          stage_status_start_date?: string | null
          start_date?: string | null
          status?: string | null
          tickets_info?: string | null
          total_paid?: number | null
          total_pending?: number | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_clients_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_mindmaps: {
        Row: {
          created_at: string | null
          edges: Json | null
          id: string
          nodes: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          edges?: Json | null
          id?: string
          nodes?: Json | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          edges?: Json | null
          id?: string
          nodes?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hub_profiles: {
        Row: {
          avatar_url: string | null
          business_context: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_context?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_context?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hub_tasks: {
        Row: {
          allocated_block_id: string | null
          allocated_date: string | null
          assigned_to: string | null
          board_id: string | null
          checklist: Json | null
          client_id: string | null
          collaborator_id: string | null
          collaborator_ids: string[] | null
          completed_at: string | null
          contact_phone: string | null
          context: Database["public"]["Enums"]["task_context"] | null
          created_at: string | null
          custom_status: string | null
          deal_value: number | null
          description: string | null
          display_order: number | null
          due_date: string | null
          estimated_minutes: number | null
          id: string
          life_area_id: string | null
          linked_process_id: string | null
          notion_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          quick_responses: Json | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          team_id: string | null
          title: string
          total_time_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocated_block_id?: string | null
          allocated_date?: string | null
          assigned_to?: string | null
          board_id?: string | null
          checklist?: Json | null
          client_id?: string | null
          collaborator_id?: string | null
          collaborator_ids?: string[] | null
          completed_at?: string | null
          contact_phone?: string | null
          context?: Database["public"]["Enums"]["task_context"] | null
          created_at?: string | null
          custom_status?: string | null
          deal_value?: number | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          life_area_id?: string | null
          linked_process_id?: string | null
          notion_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          quick_responses?: Json | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          team_id?: string | null
          title: string
          total_time_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocated_block_id?: string | null
          allocated_date?: string | null
          assigned_to?: string | null
          board_id?: string | null
          checklist?: Json | null
          client_id?: string | null
          collaborator_id?: string | null
          collaborator_ids?: string[] | null
          completed_at?: string | null
          contact_phone?: string | null
          context?: Database["public"]["Enums"]["task_context"] | null
          created_at?: string | null
          custom_status?: string | null
          deal_value?: number | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          life_area_id?: string | null
          linked_process_id?: string | null
          notion_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          quick_responses?: Json | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          team_id?: string | null
          title?: string
          total_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_tasks_allocated_block_id_fkey"
            columns: ["allocated_block_id"]
            isOneToOne: false
            referencedRelation: "routine_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_tasks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "hub_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_tasks_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_tasks_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_tasks_linked_process_id_fkey"
            columns: ["linked_process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      iagochi_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_language: string
          default_style: string | null
          full_name: string | null
          id: string
          instagram_account_id: string | null
          last_active_at: string | null
          level: number
          meta_access_token: string | null
          onboarding_completed: boolean
          plan_id: string
          streak_days: number
          stripe_customer_id: string | null
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_language?: string
          default_style?: string | null
          full_name?: string | null
          id: string
          instagram_account_id?: string | null
          last_active_at?: string | null
          level?: number
          meta_access_token?: string | null
          onboarding_completed?: boolean
          plan_id?: string
          streak_days?: number
          stripe_customer_id?: string | null
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_language?: string
          default_style?: string | null
          full_name?: string | null
          id?: string
          instagram_account_id?: string | null
          last_active_at?: string | null
          level?: number
          meta_access_token?: string | null
          onboarding_completed?: boolean
          plan_id?: string
          streak_days?: number
          stripe_customer_id?: string | null
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "iagochi_profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      iagochi_subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iagochi_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iagochi_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "iagochi_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      iagochi_webhook_events: {
        Row: {
          created_at: string
          data: Json
          error: string | null
          id: string
          processed: boolean
          processed_at: string | null
          type: string
        }
        Insert: {
          created_at?: string
          data: Json
          error?: string | null
          id: string
          processed?: boolean
          processed_at?: string | null
          type: string
        }
        Update: {
          created_at?: string
          data?: Json
          error?: string | null
          id?: string
          processed?: boolean
          processed_at?: string | null
          type?: string
        }
        Relationships: []
      }
      job_assets: {
        Row: {
          created_at: string
          expires_at: string | null
          filename: string
          height: number | null
          id: string
          job_id: string
          mime_type: string | null
          size_bytes: number | null
          sort_order: number
          storage_path: string
          storage_url: string
          type: Database["public"]["Enums"]["asset_type"]
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          filename: string
          height?: number | null
          id: string
          job_id: string
          mime_type?: string | null
          size_bytes?: number | null
          sort_order?: number
          storage_path: string
          storage_url: string
          type: Database["public"]["Enums"]["asset_type"]
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          filename?: string
          height?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          sort_order?: number
          storage_path?: string
          storage_url?: string
          type?: Database["public"]["Enums"]["asset_type"]
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "iagochi_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_usage: {
        Row: {
          carrossel_count: number
          copy_count: number
          created_at: string
          estrategia_count: number
          id: number
          jobs_completed: number
          jobs_created: number
          jobs_failed: number
          period: string
          roteiro_count: number
          total_cost_cents: number
          total_tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          carrossel_count?: number
          copy_count?: number
          created_at?: string
          estrategia_count?: number
          id?: never
          jobs_completed?: number
          jobs_created?: number
          jobs_failed?: number
          period: string
          roteiro_count?: number
          total_cost_cents?: number
          total_tokens?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          carrossel_count?: number
          copy_count?: number
          created_at?: string
          estrategia_count?: number
          id?: never
          jobs_completed?: number
          jobs_created?: number
          jobs_failed?: number
          period?: string
          roteiro_count?: number
          total_cost_cents?: number
          total_tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "iagochi_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          cost_cents: number | null
          created_at: string
          error: string | null
          failed_at: string | null
          id: string
          max_attempts: number
          model_used: string | null
          params: Json
          priority: number
          processing_time_ms: number | null
          result: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          tokens_used: number | null
          type: Database["public"]["Enums"]["job_type"]
          updated_at: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string
          error?: string | null
          failed_at?: string | null
          id: string
          max_attempts?: number
          model_used?: string | null
          params: Json
          priority?: number
          processing_time_ms?: number | null
          result?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tokens_used?: number | null
          type: Database["public"]["Enums"]["job_type"]
          updated_at?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string
          error?: string | null
          failed_at?: string | null
          id?: string
          max_attempts?: number
          model_used?: string | null
          params?: Json
          priority?: number
          processing_time_ms?: number | null
          result?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tokens_used?: number | null
          type?: Database["public"]["Enums"]["job_type"]
          updated_at?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "iagochi_profiles"
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
      life_areas: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      manual_appointments: {
        Row: {
          appointment_date: string
          client_id: string
          count: number
          created_at: string | null
          id: string
          notes: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          appointment_date?: string
          client_id: string
          count?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          appointment_date?: string
          client_id?: string
          count?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      maquina_support_tickets: {
        Row: {
          agent_id: number | null
          assigned_to: string | null
          category: string
          client_id: string
          closed_at: string | null
          created_at: string
          custom_fields: Json | null
          deadline: string | null
          description: string
          first_response_at: string | null
          id: string
          opened_at: string
          priority: string
          requester_email: string
          requester_name: string
          resolved_at: string | null
          solution: string | null
          source: string
          status: string
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
        }
        Insert: {
          agent_id?: number | null
          assigned_to?: string | null
          category?: string
          client_id: string
          closed_at?: string | null
          created_at?: string
          custom_fields?: Json | null
          deadline?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          opened_at?: string
          priority?: string
          requester_email: string
          requester_name: string
          resolved_at?: string | null
          solution?: string | null
          source?: string
          status?: string
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string
        }
        Update: {
          agent_id?: number | null
          assigned_to?: string | null
          category?: string
          client_id?: string
          closed_at?: string | null
          created_at?: string
          custom_fields?: Json | null
          deadline?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          opened_at?: string
          priority?: string
          requester_email?: string
          requester_name?: string
          resolved_at?: string | null
          solution?: string | null
          source?: string
          status?: string
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maquina_support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      maquina_ticket_comments: {
        Row: {
          author_id: string | null
          author_name: string
          author_type: string
          content: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          author_type?: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          author_type?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maquina_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "maquina_support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          concurrency: number
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          jobs_per_hour: number
          jobs_per_month: number | null
          name: string
          price_monthly_cents: number
          price_yearly_cents: number | null
          priority: number
          sort_order: number
          stripe_price_id: string | null
          stripe_price_id_year: string | null
        }
        Insert: {
          concurrency?: number
          created_at?: string
          description?: string | null
          features?: Json
          id: string
          is_active?: boolean
          jobs_per_hour?: number
          jobs_per_month?: number | null
          name: string
          price_monthly_cents?: number
          price_yearly_cents?: number | null
          priority?: number
          sort_order?: number
          stripe_price_id?: string | null
          stripe_price_id_year?: string | null
        }
        Update: {
          concurrency?: number
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          jobs_per_hour?: number
          jobs_per_month?: number | null
          name?: string
          price_monthly_cents?: number
          price_yearly_cents?: number | null
          priority?: number
          sort_order?: number
          stripe_price_id?: string | null
          stripe_price_id_year?: string | null
        }
        Relationships: []
      }
      pops: {
        Row: {
          approver_role: string | null
          checklist_items: Json | null
          created_at: string | null
          depends_on_pop_id: string | null
          description: string | null
          estimated_minutes: number | null
          execution_order: number | null
          id: string
          is_active: boolean | null
          process_id: string | null
          process_type: string | null
          quick_responses: Json | null
          requires_approval: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approver_role?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          depends_on_pop_id?: string | null
          description?: string | null
          estimated_minutes?: number | null
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          process_id?: string | null
          process_type?: string | null
          quick_responses?: Json | null
          requires_approval?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approver_role?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          depends_on_pop_id?: string | null
          description?: string | null
          estimated_minutes?: number | null
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          process_id?: string | null
          process_type?: string | null
          quick_responses?: Json | null
          requires_approval?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pops_depends_on_pop_id_fkey"
            columns: ["depends_on_pop_id"]
            isOneToOne: false
            referencedRelation: "pops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pops_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_categories: {
        Row: {
          color: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      process_executions: {
        Row: {
          actual_minutes: number | null
          assigned_to: string | null
          checklist_state: Json | null
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          pop_id: string
          priority: string | null
          result: string | null
          result_notes: string | null
          started_at: string | null
          status: string
          task_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_minutes?: number | null
          assigned_to?: string | null
          checklist_state?: Json | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          pop_id: string
          priority?: string | null
          result?: string | null
          result_notes?: string | null
          started_at?: string | null
          status?: string
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_minutes?: number | null
          assigned_to?: string | null
          checklist_state?: Json | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          pop_id?: string
          priority?: string | null
          result?: string | null
          result_notes?: string | null
          started_at?: string | null
          status?: string
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_executions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_executions_pop_id_fkey"
            columns: ["pop_id"]
            isOneToOne: false
            referencedRelation: "pops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_executions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "hub_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          category_id: string | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "process_categories"
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
      projects_revenue: {
        Row: {
          billing_unit: string | null
          client_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          monthly_value: number
          notes: string | null
          project_name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_unit?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_value?: number
          notes?: string | null
          project_name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_unit?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_value?: number
          notes?: string | null
          project_name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_revenue_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          proposal_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          proposal_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          proposal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_activities_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
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
        }
        Insert: {
          asaas_billing_type?: string | null
          asaas_payment_id?: string | null
          client_id?: string | null
          cnpj?: string | null
          company_data?: Json | null
          contract_accepted_at?: string | null
          contract_accepted_by?: string | null
          contract_content?: string | null
          contract_document_url?: string | null
          contract_template_id?: string | null
          created_at?: string | null
          custom_terms?: string | null
          delivery_time?: string | null
          description?: string | null
          discount_percent?: number | null
          discount_value?: number | null
          follow_up_notes?: string | null
          id?: string
          is_custom_negotiation?: boolean | null
          items?: Json | null
          lead_company?: string | null
          lead_contact?: string | null
          lead_email?: string | null
          lead_name: string
          lead_phone?: string | null
          lead_source?: string | null
          legal_representative?: string | null
          legal_representative_cpf?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          next_follow_up?: string | null
          notes?: string | null
          payment_link?: string | null
          payment_link_expires_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          plan_id?: string | null
          probability?: number | null
          proposal_number: string
          proposal_type?: string | null
          recurring_value?: number | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tags?: string[] | null
          title: string
          total_value?: number | null
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
          validity_days?: number | null
          viewed_at?: string | null
          won_at?: string | null
          zapsign_doc_status?: string | null
          zapsign_doc_token?: string | null
          zapsign_sign_url?: string | null
          zapsign_signed_at?: string | null
          zapsign_signed_file_url?: string | null
          zapsign_signer_token?: string | null
        }
        Update: {
          asaas_billing_type?: string | null
          asaas_payment_id?: string | null
          client_id?: string | null
          cnpj?: string | null
          company_data?: Json | null
          contract_accepted_at?: string | null
          contract_accepted_by?: string | null
          contract_content?: string | null
          contract_document_url?: string | null
          contract_template_id?: string | null
          created_at?: string | null
          custom_terms?: string | null
          delivery_time?: string | null
          description?: string | null
          discount_percent?: number | null
          discount_value?: number | null
          follow_up_notes?: string | null
          id?: string
          is_custom_negotiation?: boolean | null
          items?: Json | null
          lead_company?: string | null
          lead_contact?: string | null
          lead_email?: string | null
          lead_name?: string
          lead_phone?: string | null
          lead_source?: string | null
          legal_representative?: string | null
          legal_representative_cpf?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          next_follow_up?: string | null
          notes?: string | null
          payment_link?: string | null
          payment_link_expires_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          plan_id?: string | null
          probability?: number | null
          proposal_number?: string
          proposal_type?: string | null
          recurring_value?: number | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tags?: string[] | null
          title?: string
          total_value?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
          validity_days?: number | null
          viewed_at?: string | null
          won_at?: string | null
          zapsign_doc_status?: string | null
          zapsign_doc_token?: string | null
          zapsign_sign_url?: string | null
          zapsign_signed_at?: string | null
          zapsign_signed_file_url?: string | null
          zapsign_signer_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_contract_template_id_fkey"
            columns: ["contract_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_items: {
        Row: {
          category: string | null
          color: string | null
          completed_at: string | null
          created_at: string | null
          depends_on: string[] | null
          description: string | null
          display_order: number | null
          id: string
          is_completed: boolean | null
          planned_date: string | null
          priority: string | null
          progress: number | null
          quarter: string | null
          responsible: string | null
          started_at: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          depends_on?: string[] | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_completed?: boolean | null
          planned_date?: string | null
          priority?: string | null
          progress?: number | null
          quarter?: string | null
          responsible?: string | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          depends_on?: string[] | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_completed?: boolean | null
          planned_date?: string | null
          priority?: string | null
          progress?: number | null
          quarter?: string | null
          responsible?: string | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      routine_blocks: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          energy_level: Database["public"]["Enums"]["energy_level"] | null
          id: string
          is_fixed: boolean | null
          notes: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
          week_type: Database["public"]["Enums"]["week_cycle"] | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          energy_level?: Database["public"]["Enums"]["energy_level"] | null
          id?: string
          is_fixed?: boolean | null
          notes?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
          week_type?: Database["public"]["Enums"]["week_cycle"] | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          energy_level?: Database["public"]["Enums"]["energy_level"] | null
          id?: string
          is_fixed?: boolean | null
          notes?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          week_type?: Database["public"]["Enums"]["week_cycle"] | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          chat_id: number | null
          client_id: string
          closed_at: string | null
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
          source: string
          status: string
          total: number
          unit_price: number
        }
        Insert: {
          chat_id?: number | null
          client_id: string
          closed_at?: string | null
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
          source?: string
          status?: string
          total: number
          unit_price: number
        }
        Update: {
          chat_id?: number | null
          client_id?: string
          closed_at?: string | null
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
          source?: string
          status?: string
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
      service_plans: {
        Row: {
          annual_discount_percent: number | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          implementation_fee: number | null
          is_active: boolean | null
          min_contract_months: number | null
          monthly_price: number
          name: string
          requires_contract: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_discount_percent?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          implementation_fee?: number | null
          is_active?: boolean | null
          min_contract_months?: number | null
          monthly_price?: number
          name: string
          requires_contract?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_discount_percent?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          implementation_fee?: number | null
          is_active?: boolean | null
          min_contract_months?: number | null
          monthly_price?: number
          name?: string
          requires_contract?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_agenda_links: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          share_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          share_token?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          share_token?: string
          user_id?: string
        }
        Relationships: []
      }
      sla_dismissed_conversations: {
        Row: {
          chatwoot_conversation_id: number
          contact_name: string | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
        }
        Insert: {
          chatwoot_conversation_id: number
          contact_name?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
        }
        Update: {
          chatwoot_conversation_id?: number
          contact_name?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
        }
        Relationships: []
      }
      sla_monitor_config: {
        Row: {
          chatwoot_account_id: number
          chatwoot_api_token: string
          chatwoot_base_url: string
          created_at: string | null
          critical_threshold_minutes: number
          exclude_groups: boolean
          id: string
          inbox_ids: number[]
          is_active: boolean
          max_elapsed_hours: number
          max_suggestions: number
          notification_cooldown_hours: number
          notify_phone: string
          quiet_hours_end: string
          quiet_hours_start: string
          timezone: string
          uazapi_instance_token: string
          uazapi_server_url: string
          updated_at: string | null
          warning_threshold_minutes: number
        }
        Insert: {
          chatwoot_account_id?: number
          chatwoot_api_token: string
          chatwoot_base_url?: string
          created_at?: string | null
          critical_threshold_minutes?: number
          exclude_groups?: boolean
          id?: string
          inbox_ids?: number[]
          is_active?: boolean
          max_elapsed_hours?: number
          max_suggestions?: number
          notification_cooldown_hours?: number
          notify_phone?: string
          quiet_hours_end?: string
          quiet_hours_start?: string
          timezone?: string
          uazapi_instance_token: string
          uazapi_server_url?: string
          updated_at?: string | null
          warning_threshold_minutes?: number
        }
        Update: {
          chatwoot_account_id?: number
          chatwoot_api_token?: string
          chatwoot_base_url?: string
          created_at?: string | null
          critical_threshold_minutes?: number
          exclude_groups?: boolean
          id?: string
          inbox_ids?: number[]
          is_active?: boolean
          max_elapsed_hours?: number
          max_suggestions?: number
          notification_cooldown_hours?: number
          notify_phone?: string
          quiet_hours_end?: string
          quiet_hours_start?: string
          timezone?: string
          uazapi_instance_token?: string
          uazapi_server_url?: string
          updated_at?: string | null
          warning_threshold_minutes?: number
        }
        Relationships: []
      }
      sla_notifications_log: {
        Row: {
          ai_suggestion: string | null
          batch_id: string
          chatwoot_conversation_id: number
          contact_name: string | null
          created_at: string | null
          elapsed_minutes: number
          error_message: string | null
          id: string
          inbox_name: string | null
          last_message_preview: string | null
          notification_sent: boolean | null
          severity: string
        }
        Insert: {
          ai_suggestion?: string | null
          batch_id: string
          chatwoot_conversation_id: number
          contact_name?: string | null
          created_at?: string | null
          elapsed_minutes: number
          error_message?: string | null
          id?: string
          inbox_name?: string | null
          last_message_preview?: string | null
          notification_sent?: boolean | null
          severity: string
        }
        Update: {
          ai_suggestion?: string | null
          batch_id?: string
          chatwoot_conversation_id?: number
          contact_name?: string | null
          created_at?: string | null
          elapsed_minutes?: number
          error_message?: string | null
          id?: string
          inbox_name?: string | null
          last_message_preview?: string | null
          notification_sent?: boolean | null
          severity?: string
        }
        Relationships: []
      }
      smart_alerts: {
        Row: {
          action_label: string | null
          action_url: string | null
          alert_type: string
          created_at: string | null
          description: string | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          related_entity_id: string | null
          related_entity_type: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      status_templates: {
        Row: {
          created_at: string
          id: string
          stage_key: string
          statuses: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stage_key: string
          statuses?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stage_key?: string
          statuses?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategic_goals: {
        Row: {
          category: string
          created_at: string | null
          current_value: number | null
          deadline: string | null
          description: string | null
          id: string
          is_active: boolean | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      support_api_keys: {
        Row: {
          can_create_tickets: boolean | null
          can_read_tickets: boolean | null
          can_update_tickets: boolean | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used_at: string | null
          name: string
          organization: string | null
          rate_limit_per_hour: number | null
        }
        Insert: {
          can_create_tickets?: boolean | null
          can_read_tickets?: boolean | null
          can_update_tickets?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id: string
          is_active?: boolean | null
          key_hash: string
          last_used_at?: string | null
          name: string
          organization?: string | null
          rate_limit_per_hour?: number | null
        }
        Update: {
          can_create_tickets?: boolean | null
          can_read_tickets?: boolean | null
          can_update_tickets?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used_at?: string | null
          name?: string
          organization?: string | null
          rate_limit_per_hour?: number | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          api_key_id: string | null
          assigned_to: string | null
          category: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_notes: string | null
          closed_at: string | null
          collaborator_id: string | null
          conversation_link: string | null
          created_at: string | null
          custom_fields: Json | null
          deadline: string | null
          department: string | null
          description: string
          first_response_at: string | null
          id: string
          opened_at: string | null
          priority: string | null
          requester_company: string | null
          requester_email: string | null
          requester_name: string | null
          requester_phone: string | null
          resolution_time_hours: number | null
          resolved_at: string | null
          severity: string | null
          solution: string | null
          source: string | null
          status: string | null
          subject: string | null
          tags: string[] | null
          ticket_number: string
          ticket_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          assigned_to?: string | null
          category?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_notes?: string | null
          closed_at?: string | null
          collaborator_id?: string | null
          conversation_link?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deadline?: string | null
          department?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          opened_at?: string | null
          priority?: string | null
          requester_company?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution_time_hours?: number | null
          resolved_at?: string | null
          severity?: string | null
          solution?: string | null
          source?: string | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          ticket_number: string
          ticket_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          assigned_to?: string | null
          category?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_notes?: string | null
          closed_at?: string | null
          collaborator_id?: string | null
          conversation_link?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deadline?: string | null
          department?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          opened_at?: string | null
          priority?: string | null
          requester_company?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution_time_hours?: number | null
          resolved_at?: string | null
          severity?: string | null
          solution?: string | null
          source?: string | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          ticket_number?: string
          ticket_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "hub_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_entries: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "hub_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          role: string
          team_id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          role?: string
          team_id: string
          token?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: string
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_executions: {
        Row: {
          bugs_found: Json | null
          case_results: Json | null
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          execution_id: string | null
          failed_cases: number | null
          id: string
          notes: string | null
          passed_cases: number | null
          protocol_id: string
          result: string | null
          skipped_cases: number | null
          started_at: string | null
          status: string
          tester_id: string | null
          total_cases: number | null
          updated_at: string | null
          user_id: string
          version_tested: string | null
        }
        Insert: {
          bugs_found?: Json | null
          case_results?: Json | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          execution_id?: string | null
          failed_cases?: number | null
          id?: string
          notes?: string | null
          passed_cases?: number | null
          protocol_id: string
          result?: string | null
          skipped_cases?: number | null
          started_at?: string | null
          status?: string
          tester_id?: string | null
          total_cases?: number | null
          updated_at?: string | null
          user_id: string
          version_tested?: string | null
        }
        Update: {
          bugs_found?: Json | null
          case_results?: Json | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          execution_id?: string | null
          failed_cases?: number | null
          id?: string
          notes?: string | null
          passed_cases?: number | null
          protocol_id?: string
          result?: string | null
          skipped_cases?: number | null
          started_at?: string | null
          status?: string
          tester_id?: string | null
          total_cases?: number | null
          updated_at?: string | null
          user_id?: string
          version_tested?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_executions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hub_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_executions_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_view"
            referencedColumns: ["execution_id"]
          },
          {
            foreignKeyName: "test_executions_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "process_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_executions_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "test_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      test_protocols: {
        Row: {
          area: string | null
          created_at: string | null
          description: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          pop_id: string | null
          prerequisites: string | null
          tags: string[] | null
          test_cases: Json | null
          test_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area?: string | null
          created_at?: string | null
          description?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          pop_id?: string | null
          prerequisites?: string | null
          tags?: string[] | null
          test_cases?: Json | null
          test_type?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area?: string | null
          created_at?: string | null
          description?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          pop_id?: string | null
          prerequisites?: string | null
          tags?: string[] | null
          test_cases?: Json | null
          test_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_protocols_pop_id_fkey"
            columns: ["pop_id"]
            isOneToOne: false
            referencedRelation: "pops"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          comment_id: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          ticket_id: string
          uploaded_by: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          ticket_id: string
          uploaded_by?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          ticket_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "ticket_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          author_id: string | null
          author_name: string
          author_type: string | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          author_type?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          author_type?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      user_features: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          feature_id: string
          granted_by: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          feature_id: string
          granted_by?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          feature_id?: string
          granted_by?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          integration_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          integration_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          integration_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          notes: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          notes?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          notes?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      variable_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          is_paid: boolean
          notes: string | null
          payment_method: string | null
          reference_month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          is_paid?: boolean
          notes?: string | null
          payment_method?: string | null
          reference_month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_paid?: boolean
          notes?: string | null
          payment_method?: string | null
          reference_month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_debug: {
        Row: {
          created_at: string | null
          id: number
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: number
          payload?: Json | null
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          created_at: string | null
          energy_average: number | null
          id: string
          main_distractions: string | null
          notes: string | null
          productivity_score: number | null
          self_care_rating: number | null
          updated_at: string | null
          user_id: string
          week_start: string
          what_to_improve: string | null
          what_worked_well: string | null
        }
        Insert: {
          created_at?: string | null
          energy_average?: number | null
          id?: string
          main_distractions?: string | null
          notes?: string | null
          productivity_score?: number | null
          self_care_rating?: number | null
          updated_at?: string | null
          user_id: string
          week_start: string
          what_to_improve?: string | null
          what_worked_well?: string | null
        }
        Update: {
          created_at?: string | null
          energy_average?: number | null
          id?: string
          main_distractions?: string | null
          notes?: string | null
          productivity_score?: number | null
          self_care_rating?: number | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
          what_to_improve?: string | null
          what_worked_well?: string | null
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          ai_insights: string | null
          ai_recommendations: Json | null
          commitment_confirmed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          inbox_items_processed: number | null
          inbox_processed: boolean | null
          next_week_goal: string | null
          retrospective: Json | null
          step_completed: number | null
          tasks_reviewed: Json | null
          top_priorities: Json | null
          user_id: string
          week_start: string
        }
        Insert: {
          ai_insights?: string | null
          ai_recommendations?: Json | null
          commitment_confirmed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          inbox_items_processed?: number | null
          inbox_processed?: boolean | null
          next_week_goal?: string | null
          retrospective?: Json | null
          step_completed?: number | null
          tasks_reviewed?: Json | null
          top_priorities?: Json | null
          user_id: string
          week_start: string
        }
        Update: {
          ai_insights?: string | null
          ai_recommendations?: Json | null
          commitment_confirmed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          inbox_items_processed?: number | null
          inbox_processed?: boolean | null
          next_week_goal?: string | null
          retrospective?: Json | null
          step_completed?: number | null
          tasks_reviewed?: Json | null
          top_priorities?: Json | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
          variables: string[] | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
          variables?: string[] | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      zapsign_config: {
        Row: {
          api_token: string
          created_at: string | null
          environment: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_token: string
          created_at?: string | null
          environment?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_token?: string
          created_at?: string | null
          environment?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      calculate_maquina_ticket_deadline: {
        Args: { p_opened_at: string; p_priority: string }
        Returns: string
      }
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
      create_auth_user: {
        Args: { p_email: string; p_password: string }
        Returns: string
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
      generate_maquina_ticket_number: { Args: never; Returns: string }
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
      update_creative_thumbnails: {
        Args: { p_client_id: string; p_data: Json }
        Returns: number
      }
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
