import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ClientAgent {
  id: number
  nome_cliente: string | null
  nome_agente: string | null
  canal: string | null
  em_uso: boolean | null
  versao: string | null
  prompt_agente: string | null
  modelo_llm: string | null
  temperatura: number | null
  top_p: number | null
  debounce_segundos: number | null
  tags: string[] | null
  slug: string | null
  instagram_username: string | null
  telefone_instancia: string | null
  tts_habilitado: boolean | null
  rag_habilitado: boolean | null
  horario_funcionamento_habilitado: boolean | null
  horario_funcionamento_inicio: number | null
  horario_funcionamento_fim: number | null
  mensagem_fora_horario: string | null
  handoff_mensagem_fixa: string | null
  canais_ativos: unknown
  roles: {
    whatsapp: boolean
    instagram: boolean
  }
}

export interface AgentRefinement {
  id: number
  tipo_gatilho: string | null
  palavras_chave: string[] | null
  descricao_intencao: string | null
  resposta_errada: string | null
  resposta_correta: string | null
  instrucao_adicional: string | null
  ativo: boolean | null
  created_at: string
}

interface ListResponse {
  client_id: string
  business_name: string
  agents: ClientAgent[]
  links: { whatsapp: number | null; instagram: number | null }
  message?: string
}

const FN_NAME = 'client-agents'

function resolveClientParam(): string {
  const selected = typeof window !== 'undefined' ? localStorage.getItem('selectedClientId') : null
  return selected ? `&client_id=${encodeURIComponent(selected)}` : ''
}

async function callFn<T>(
  action: string,
  opts: { method?: 'GET' | 'POST'; body?: Record<string, unknown> } = {},
): Promise<T> {
  const { method = 'GET', body } = opts
  const qs = `${action}${resolveClientParam()}`
  const { data, error } = await supabase.functions.invoke<T>(
    `${FN_NAME}?action=${qs}`,
    { method, body },
  )
  if (error) throw error
  return data as T
}

export function useClientAgents() {
  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await callFn<ListResponse>('list')
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}

export function useAgentDetail(agentId: number | null) {
  const [agent, setAgent] = useState<ClientAgent | null>(null)
  const [refinements, setRefinements] = useState<AgentRefinement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!agentId) return
    setLoading(true)
    setError(null)
    try {
      const res = await callFn<{ agent: ClientAgent; refinements: AgentRefinement[] }>(
        `detail&id=${agentId}`,
      )
      setAgent(res.agent)
      setRefinements(res.refinements ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    load()
  }, [load])

  return { agent, refinements, loading, error, reload: load }
}
