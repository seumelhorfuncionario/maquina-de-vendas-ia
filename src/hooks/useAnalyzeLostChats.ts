import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface AnalyzeResponse {
  success: true
  processed: number
  pending: number
  results?: { chat_id: number; category: string; confidence: number }[]
}

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (clientProfileId) return clientProfileId
  if (isSuperAdmin && typeof window !== 'undefined') {
    return localStorage.getItem('selectedClientId')
  }
  return null
}

export function useAnalyzeLostChats() {
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)
  const queryClient = useQueryClient()

  return useMutation<AnalyzeResponse, Error, { batchSize?: number; periodDays?: number } | void>({
    mutationFn: async (opts) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
      const { data: { session } } = await supabase.auth.getSession()
      if (!supabaseUrl || !session || !anonKey) {
        throw new Error('Sessão inválida.')
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/analyze-lost-chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          client_id: clientId,
          batch_size: opts?.batchSize ?? 15,
          period_days: opts?.periodDays ?? 30,
        }),
      })
      const text = await res.text()
      const parsed = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(parsed.error || parsed.details || `HTTP ${res.status}`)
      return parsed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report_metrics', clientId] })
    },
  })
}
