import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { ProductionOrder, ProductionStatus } from '../types'

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

      const { data, error: fetchError } = await supabase
        .from('production_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const mapped: ProductionOrder[] = (data || []).map(p => ({
        id: p.id,
        clientName: p.customer_name,
        product: p.product_name,
        quantity: p.quantity || 1,
        status: (p.status as ProductionStatus) || 'pending',
        createdAt: p.created_at || new Date().toISOString(),
      }))

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
      const { error } = await supabase
        .from('production_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error updating production status:', error)
        fetchProduction()
      }
    } catch (err) {
      console.error('Error moving production order:', err)
      fetchProduction()
    }
  }

  return { production, loading, error, moveProductionStatus, refetch: fetchProduction }
}
