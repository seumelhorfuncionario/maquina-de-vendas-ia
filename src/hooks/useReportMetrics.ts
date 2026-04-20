import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

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
}

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (clientProfileId) return clientProfileId
  if (isSuperAdmin && typeof window !== 'undefined') {
    return localStorage.getItem('selectedClientId')
  }
  return null
}

export function useReportMetrics(periodDays: number = 7) {
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)

  return useQuery<ReportStats>({
    queryKey: ['report_metrics', clientId, periodDays],
    enabled: !!clientId,
    staleTime: 5 * 60_000,
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
        body: JSON.stringify({ client_id: clientId, period_days: periodDays }),
      })

      const text = await res.text()
      let parsed: unknown
      try {
        parsed = text ? JSON.parse(text) : {}
      } catch {
        parsed = { raw: text }
      }

      if (!res.ok) {
        const msg =
          (parsed as { error?: string; details?: string }).error ||
          (parsed as { details?: string }).details ||
          `HTTP ${res.status}`
        throw new Error(msg)
      }

      return (parsed as { stats: ReportStats }).stats
    },
  })
}
