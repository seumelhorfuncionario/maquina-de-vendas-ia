import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ClientTicket {
  id: string
  ticket_number: string | null
  subject: string | null
  title: string | null
  description: string | null
  status: string | null
  priority: string | null
  category: string | null
  ticket_type: string | null
  department: string | null
  created_at: string
  updated_at: string | null
  opened_at: string | null
  first_response_at: string | null
  resolved_at: string | null
  closed_at: string | null
  solution: string | null
  conversation_link: string | null
  tags: string[] | null
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
  const { data, error } = await supabase.functions.invoke<T>(
    `${FN_NAME}?action=${qs}`,
    {
      method,
      body,
    },
  )
  if (error) throw error
  return data as T
}

export function useClientTickets() {
  const [tickets, setTickets] = useState<ClientTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await callFn<{ tickets: ClientTicket[] }>('list')
      setTickets(res.tickets ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createTicket = useCallback(
    async (input: { subject: string; description: string; priority?: string; category?: string }) => {
      const res = await callFn<{ ticket: ClientTicket }>('create', {
        method: 'POST',
        body: input,
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
