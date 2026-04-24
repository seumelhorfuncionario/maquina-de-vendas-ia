import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface AIChatResponse {
  success: true
  response: string
  timestamp: string
}

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (isSuperAdmin && typeof window !== 'undefined') {
    const selected = localStorage.getItem('selectedClientId')
    if (selected) return selected
  }
  return clientProfileId ?? null
}

export function useAIChat() {
  const { clientProfile, isSuperAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      const trimmed = message.trim()
      if (!trimmed) {
        throw new Error('Mensagem vazia')
      }

      const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
      const { data: { session } } = await supabase.auth.getSession()

      if (!supabaseUrl || !session || !anonKey) {
        throw new Error('Sessão inválida — faça login novamente.')
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ message: trimmed, ...(clientId ? { client_id: clientId } : {}) }),
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

        const data = parsed as AIChatResponse
        queryClient.invalidateQueries({ queryKey: ['assistant_conversations', clientId] })
        return data.response
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [clientProfile?.id, isSuperAdmin, queryClient],
  )

  return { sendMessage, loading, error }
}
