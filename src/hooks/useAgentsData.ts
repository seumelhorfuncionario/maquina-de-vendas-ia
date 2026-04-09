import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'

// Credenciais do banco de agentes — hardcoded pois é read-only (anon key)
const AGENTS_SUPABASE_URL = 'https://wacotfqoarsbazrreeco.supabase.co'
const AGENTS_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY290ZnFvYXJzYmF6cnJlZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjQ1NzUsImV4cCI6MjA4ODk0MDU3NX0.FPnMo8LMKuj3hLNxBILU-B8LyhcdJ32kO2Ceqd0HUaY'

interface AgentsConfig {
  agent_whatsapp_id: number | null
  agent_instagram_id: number | null
  agents_supabase_ref: string | null
}

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
  config: AgentsConfig | null
}

const EMPTY_STATE: AgentsData = {
  agendamentos: [],
  agendamentosCount: 0,
  chatsWhatsapp: 0,
  chatsInstagram: 0,
  loading: false,
  config: null,
}

async function fetchFromAgents(path: string, params: string = '') {
  const url = `${AGENTS_SUPABASE_URL}/rest/v1/${path}${params ? '?' + params : ''}`
  const res = await fetch(url, {
    headers: {
      'apikey': AGENTS_SUPABASE_KEY,
      'Authorization': `Bearer ${AGENTS_SUPABASE_KEY}`,
      'Prefer': 'count=exact',
    },
  })
  if (!res.ok) return { data: [], count: 0 }
  const count = res.headers.get('content-range')?.split('/')?.pop()
  const data = await res.json()
  if (!Array.isArray(data)) return { data: [], count: 0 }
  return { data, count: count ? parseInt(count) : data.length }
}

export const useAgentsData = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [state, setState] = useState<AgentsData>({ ...EMPTY_STATE, loading: true })

  const fetchData = useCallback(async () => {
    if (!clientId) {
      setState(EMPTY_STATE)
      return
    }

    try {
      // Buscar config de agentes do cliente
      const { data: client } = await supabase
        .from('clients')
        .select('agent_whatsapp_id, agent_instagram_id, agents_supabase_ref')
        .eq('id', clientId)
        .single()

      const config: AgentsConfig = {
        agent_whatsapp_id: client?.agent_whatsapp_id || null,
        agent_instagram_id: client?.agent_instagram_id || null,
        agents_supabase_ref: client?.agents_supabase_ref || null,
      }

      // Se não tem agentes configurados, retorna vazio sem loading
      if (!config.agent_whatsapp_id && !config.agent_instagram_id) {
        setState({ ...EMPTY_STATE, config })
        return
      }

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const promises: Promise<{ data: any[]; count: number }>[] = []

      if (config.agent_whatsapp_id) {
        promises.push(
          fetchFromAgents('agendamentos', `agente_id=eq.${config.agent_whatsapp_id}&data_inicio=gte.${monthStart}&order=data_inicio.asc&select=id,nome_cliente,procedimento,data_inicio,data_fim,status,telefone_cliente`)
        )
        promises.push(
          fetchFromAgents('chats', `agente_id=eq.${config.agent_whatsapp_id}&select=id&limit=1`)
        )
      } else {
        promises.push(Promise.resolve({ data: [], count: 0 }))
        promises.push(Promise.resolve({ data: [], count: 0 }))
      }

      if (config.agent_instagram_id) {
        promises.push(
          fetchFromAgents('chats', `agente_id=eq.${config.agent_instagram_id}&select=id&limit=1`)
        )
      } else {
        promises.push(Promise.resolve({ data: [], count: 0 }))
      }

      const [agendRes, whatsRes, instaRes] = await Promise.all(promises)

      setState({
        agendamentos: agendRes.data || [],
        agendamentosCount: agendRes.data?.length || 0,
        chatsWhatsapp: whatsRes.count || 0,
        chatsInstagram: instaRes.count || 0,
        loading: false,
        config,
      })
    } catch (err) {
      console.error('Error fetching agents data:', err)
      setState(EMPTY_STATE)
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading) fetchData()
  }, [clientLoading, fetchData])

  return { ...state, refetch: fetchData }
}
