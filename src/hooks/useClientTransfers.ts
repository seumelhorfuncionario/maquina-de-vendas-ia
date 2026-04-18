import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ClientTransfersSummary {
  total: number
  active: number
  finalized: number
  by_day: Array<{ day: string; count: number }>
  days: number
}

const FN_NAME = 'client-transfers'

function resolveClientIdParam(): string {
  const selected = typeof window !== 'undefined' ? localStorage.getItem('selectedClientId') : null
  return selected ? `&client_id=${encodeURIComponent(selected)}` : ''
}

export function useClientTransfers(days = 30) {
  const [data, setData] = useState<ClientTransfersSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
      const { data: { session } } = await supabase.auth.getSession()
      if (!supabaseUrl || !anonKey || !session) {
        throw new Error('Sessão inválida — faça login novamente.')
      }

      const qs = `?days=${days}${resolveClientIdParam()}`
      const res = await fetch(`${supabaseUrl}/functions/v1/${FN_NAME}${qs}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
      })

      const text = await res.text()
      const parsed = text ? JSON.parse(text) : {}

      if (!res.ok) {
        throw new Error((parsed as { error?: string }).error || `HTTP ${res.status}`)
      }

      setData(parsed as ClientTransfersSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}
