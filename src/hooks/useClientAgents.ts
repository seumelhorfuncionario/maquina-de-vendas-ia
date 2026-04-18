import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ClientAgent {
  id: number
  nome_cliente: string | null
  nome_agente: string | null
  canal: string | null
  em_uso: boolean | null
  versao: string | null
  modelo_llm: string | null
  tags: string[] | null
  slug: string | null
  instagram_username: string | null
  telefone_instancia: string | null
  rag_habilitado: boolean | null
  horario_funcionamento_habilitado: boolean | null
  refinar_token: string | null
  roles: {
    whatsapp: boolean
    instagram: boolean
  }
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

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const { data: { session } } = await supabase.auth.getSession()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!supabaseUrl || !session || !anonKey) {
    throw new Error('Sessão inválida — faça login novamente.')
  }

  const url = `${supabaseUrl}/functions/v1/${FN_NAME}?action=${qs}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
    body: body ? JSON.stringify(body) : undefined,
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
      (parsed as { error?: string; message?: string }).error ||
      (parsed as { message?: string }).message ||
      `HTTP ${res.status}`
    throw new Error(msg)
  }

  return parsed as T
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
