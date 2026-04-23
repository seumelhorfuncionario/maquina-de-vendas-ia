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
  criado_em?: string | null
  conversation_id?: string | null
  comprovante_url?: string | null
}

interface AgentsData {
  agendamentos: Agendamento[]
  agendamentosCount: number
  chatsWhatsapp: number
  chatsWhatsappTotal: number
  chatsInstagram: number
  chatsInstagramTotal: number
  appointmentValue: number
  estimatedRevenue: number
  cwBaseUrl: string | null
  cwAccountId: string | null
  loading: boolean
}

const EMPTY: AgentsData = {
  agendamentos: [],
  agendamentosCount: 0,
  chatsWhatsapp: 0,
  chatsWhatsappTotal: 0,
  chatsInstagram: 0,
  chatsInstagramTotal: 0,
  appointmentValue: 0,
  estimatedRevenue: 0,
  cwBaseUrl: null,
  cwAccountId: null,
  loading: false,
}

export interface AgentsRange {
  from: string
  to?: string
}

export const useAgentsData = (range?: AgentsRange | string) => {
  const { clientId, loading: clientLoading } = useClientId()
  const [state, setState] = useState<AgentsData>({ ...EMPTY, loading: true })

  const dateFrom = typeof range === 'string' ? range : range?.from
  const dateTo = typeof range === 'string' ? undefined : range?.to

  const fetchData = useCallback(async () => {
    if (!clientId || !SUPABASE_URL) {
      setState(EMPTY)
      return
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/agents-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, dateFrom, dateTo }),
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
        chatsWhatsappTotal: data.chatsWhatsappTotal || 0,
        chatsInstagram: data.chatsInstagram || 0,
        chatsInstagramTotal: data.chatsInstagramTotal || 0,
        appointmentValue: data.appointmentValue || 0,
        estimatedRevenue: data.estimatedRevenue || 0,
        cwBaseUrl: data.cwBaseUrl || null,
        cwAccountId: data.cwAccountId || null,
        loading: false,
      })
    } catch (err) {
      console.error('Error fetching agents data:', err)
      setState(EMPTY)
    }
  }, [clientId, dateFrom, dateTo])

  useEffect(() => {
    if (!clientLoading) fetchData()
  }, [clientLoading, fetchData])

  return { ...state, refetch: fetchData }
}
