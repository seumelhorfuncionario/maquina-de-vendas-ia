import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { ProductionOrder, ProductionStatus } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export const useProduction = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [production, setProduction] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduction = useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Busca orders + chats em paralelo para resolver phone
      const [{ data, error: fetchError }, { data: chatsData }] = await Promise.all([
        supabase
          .from('production_orders')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('chats')
          .select('id_kanban, nome, phone')
          .eq('client_id', clientId),
      ])

      if (fetchError) throw fetchError

      // Build lookup maps: id_kanban → phone, nome → phone
      const phoneByKanban = new Map<string, string>()
      const phoneByName = new Map<string, string>()
      for (const ch of (chatsData || []) as any[]) {
        if (ch.phone) {
          if (ch.id_kanban) phoneByKanban.set(ch.id_kanban, ch.phone)
          if (ch.nome) phoneByName.set(ch.nome, ch.phone)
        }
      }

      const mapped: ProductionOrder[] = (data || []).map((p: any) => {
        // Resolve phone: primeiro por kanban_item no notes, fallback por nome
        const kanbanMatch = (p.notes || '').match(/kanban_item:(\d+)/)
        const kanbanId = kanbanMatch?.[1]
        const phone = (kanbanId && phoneByKanban.get(kanbanId)) || phoneByName.get(p.customer_name) || undefined

        return {
          id: p.id,
          clientName: p.customer_name,
          product: p.product_name,
          quantity: p.quantity || 1,
          status: (p.status as ProductionStatus) || 'pending',
          createdAt: p.created_at || new Date().toISOString(),
          phone,
          kanbanItemId: kanbanId,
        }
      })

      setProduction(mapped)
    } catch (err) {
      console.error('Error fetching production orders:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar pedidos')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading && clientId) {
      fetchProduction()
    } else if (!clientLoading) {
      setLoading(false)
    }
  }, [clientId, clientLoading, fetchProduction])

  const moveProductionStatus = async (id: string, newStatus: ProductionStatus) => {
    // Update otimista
    setProduction(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))

    try {
      // Atualizar no banco local
      const { error } = await supabase
        .from('production_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error updating production status:', error)
        fetchProduction()
        return
      }

      // Sync bidirecional: atualizar no CRM (funil de produção)
      const order = production.find(p => p.id === id)
      if (!order) return

      // Buscar o kanban_item_id do notes
      const { data: orderData } = await supabase
        .from('production_orders')
        .select('notes')
        .eq('id', id)
        .single()

      const notes = orderData?.notes || ''
      const kanbanMatch = notes.match(/kanban_item:(\d+)/)
      if (kanbanMatch && clientId && SUPABASE_URL) {
        const kanbanItemId = kanbanMatch[1]
        fetch(`${SUPABASE_URL}/functions/v1/kanban-move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            kanbanItemId,
            newStageName: newStatus,
            isProduction: true,
          }),
        }).catch(err => console.error('Production kanban sync error:', err))
      }
    } catch (err) {
      console.error('Error moving production order:', err)
      fetchProduction()
    }
  }

  return { production, loading, error, moveProductionStatus, refetch: fetchProduction }
}
