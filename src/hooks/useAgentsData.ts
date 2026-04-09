import { useEffect, useState, useCallback } from 'react'
import { useClientId } from './useClientId'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

interface Agendamento {
  id: number
  nome_cliente: string
  procedimento: string
  data_inicio: string
  data_fim: string
  status: string
  telefone_cliente: string
}

interface AgentsData {
  agendamentos: Agendamento[]
  agendamentosCount: number
  chatsWhatsapp: number
  chatsInstagram: number
  loading: boolean
}

const EMPTY: AgentsData = {
  agendamentos: [],
  agendamentosCount: 0,
  chatsWhatsapp: 0,
  chatsInstagram: 0,
  loading: false,
}

export const useAgentsData = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [state, setState] = useState<AgentsData>({ ...EMPTY, loading: true })

  const fetchData = useCallback(async () => {
    if (!clientId || !SUPABASE_URL) {
      setState(EMPTY)
      return
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/agents-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })

      if (!res.ok) {
        setState(EMPTY)
        return
      }

      const data = await res.json()

      setState({
        agendamentos: data.agendamentos || [],
        agendamentosCount: data.agendamentosCount || 0,
        chatsWhatsapp: data.chatsWhatsapp || 0,
        chatsInstagram: data.chatsInstagram || 0,
        loading: false,
      })
    } catch (err) {
      console.error('Error fetching agents data:', err)
      setState(EMPTY)
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading) fetchData()
  }, [clientLoading, fetchData])

  return { ...state, refetch: fetchData }
}
