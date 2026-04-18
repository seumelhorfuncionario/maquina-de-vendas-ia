import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ClientTicket {
  id: string
  ticket_number: string | null
  subject: string | null
  description: string | null
  status: string | null
  priority: string | null
  category: string | null
  created_at: string
  updated_at: string | null
  opened_at: string | null
  first_response_at: string | null
  resolved_at: string | null
  closed_at: string | null
  solution: string | null
  tags: string[] | null
  deadline: string | null
  agent_id: number | null
}

export interface TicketComment {
  id: string
  author_name: string
  author_type: string
  content: string
  is_internal: boolean
  created_at: string
}

const FN_NAME = 'client-tickets'

// When a super-admin is viewing a specific client, we pass client_id via query.
function resolveClientIdParam(): string {
  const selected = typeof window !== 'undefined' ? localStorage.getItem('selectedClientId') : null
  return selected ? `&client_id=${encodeURIComponent(selected)}` : ''
}

async function callFn<T>(
  action: string,
  opts: { method?: 'GET' | 'POST'; body?: Record<string, unknown> } = {},
): Promise<T> {
  const { method = 'GET', body } = opts
  const qs = `${action}${resolveClientIdParam()}`

  // Use fetch directly so we can read the server-side error body on non-2xx.
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

export function useClientTickets(options: { agentId?: number | null } = {}) {
  const { agentId } = options
  const [tickets, setTickets] = useState<ClientTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const suffix = agentId != null ? `&agent_id=${agentId}` : ''
      const res = await callFn<{ tickets: ClientTicket[] }>(`list${suffix}`)
      setTickets(res.tickets ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    load()
  }, [load])

  const createTicket = useCallback(
    async (input: {
      subject: string
      description: string
      priority?: string
      category?: string
      agent_id?: number | null
    }) => {
      const res = await callFn<{ ticket: ClientTicket }>('create', {
        method: 'POST',
        body: input as Record<string, unknown>,
      })
      await load()
      return res.ticket
    },
    [load],
  )

  return { tickets, loading, error, reload: load, createTicket }
}

export function useTicketDetail(ticketId: string | null) {
  const [ticket, setTicket] = useState<ClientTicket | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      const res = await callFn<{ ticket: ClientTicket; comments: TicketComment[] }>(
        `detail&id=${encodeURIComponent(ticketId)}`,
      )
      setTicket(res.ticket)
      setComments(res.comments ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  const addComment = useCallback(
    async (content: string) => {
      if (!ticketId) return
      await callFn<{ comment: TicketComment }>('comment', {
        method: 'POST',
        body: { ticket_id: ticketId, content },
      })
      await load()
    },
    [ticketId, load],
  )

  return { ticket, comments, loading, error, reload: load, addComment }
}
