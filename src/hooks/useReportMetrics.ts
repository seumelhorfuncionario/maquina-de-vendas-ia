import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { DateRange } from '@/components/DateRangePicker'

export type LostReasonCategory = 'preco' | 'horario' | 'sem_resposta' | 'duvida_nao_sanada' | 'ja_tem_outro' | 'nao_qualificado' | 'pesquisando' | 'outro'

export interface LostReasonChat {
  chat_external_id: string
  excerpt: string | null
  conversation_id: string | null
}

export interface ReportStats {
  period_days: number
  atendimentos: { total: number; whatsapp: number; instagram: number }
  agendamentos: { total: number; valor_medio: number; receita_estimada: number }
  taxa_agendamento_pct: number
  heatmap: number[][]
  top_dow_hora: { dow: number; hora: number; count: number; dow_nome: string }[]
  top_status: { status: string; count: number }[]
  tempo_ate_agendar: { amostra: number; mediana_h: number | null; media_h: number | null; p90_h: number | null }
  nao_agendaram: { total: number; pct: number }
  top_lost_reasons: { category: LostReasonCategory; count: number; pct: number; chats: LostReasonChat[] }[]
  total_analisados: number
}

export interface ReportResponse {
  stats: ReportStats
  cw_base_url: string | null
  cw_account_id: string | null
}

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (clientProfileId) return clientProfileId
  if (isSuperAdmin && typeof window !== 'undefined') {
    return localStorage.getItem('selectedClientId')
  }
  return null
}

export function useReportMetrics(range: DateRange) {
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)
  const dateFromISO = range.from.toISOString()
  const dateToISO = range.to.toISOString()

  return useQuery<ReportResponse>({
    queryKey: ['report_metrics', clientId, dateFromISO, dateToISO],
    enabled: !!clientId,
    // staleTime curto pra evitar que um deploy novo da edge function
    // fique mascarado por cache ate 5min no browser.
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
      const { data: { session } } = await supabase.auth.getSession()

      if (!supabaseUrl || !session || !anonKey) {
        throw new Error('Sessão inválida — faça login novamente.')
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/client-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ client_id: clientId, date_from: dateFromISO, date_to: dateToISO }),
      })

      const text = await res.text()
      let parsed: any
      try {
        parsed = text ? JSON.parse(text) : {}
      } catch {
        parsed = { raw: text }
      }

      if (!res.ok) {
        const msg = parsed?.error || parsed?.details || `HTTP ${res.status}`
        throw new Error(msg)
      }

      return {
        stats: parsed.stats as ReportStats,
        cw_base_url: parsed.cw_base_url ?? null,
        cw_account_id: parsed.cw_account_id ?? null,
      }
    },
  })
}
