import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/types/database'

export type AIInsight = Database['public']['Tables']['ai_insights']['Row']
export type AIInsightType = 'tendencia' | 'objecao' | 'oportunidade' | 'gargalo' | 'analise'
export type AIInsightPriority = 'baixa' | 'media' | 'alta'

interface GenerateInsightsResponse {
  success: true
  insights: AIInsight[]
  generated_at: string
}

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (clientProfileId) return clientProfileId
  if (isSuperAdmin && typeof window !== 'undefined') {
    return localStorage.getItem('selectedClientId')
  }
  return null
}

export function useAIInsights() {
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)

  return useQuery<AIInsight[]>({
    queryKey: ['ai_insights', clientId],
    enabled: !!clientId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('client_id', clientId!)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data ?? []
    },
  })
}

export function useMarkInsightRead() {
  const queryClient = useQueryClient()
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_insights').update({ is_read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_insights', clientId] })
    },
  })
}

export function useDismissInsight() {
  const queryClient = useQueryClient()
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_insights').update({ dismissed: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_insights', clientId] })
    },
  })
}

export function useGenerateInsights() {
  const queryClient = useQueryClient()
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)

  return useMutation<GenerateInsightsResponse, Error, void>({
    mutationFn: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
      const { data: { session } } = await supabase.auth.getSession()

      if (!supabaseUrl || !session || !anonKey) {
        throw new Error('Sessão inválida — faça login novamente.')
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
        body: JSON.stringify(clientId ? { client_id: clientId } : {}),
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

      return parsed as GenerateInsightsResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_insights', clientId] })
    },
  })
}
