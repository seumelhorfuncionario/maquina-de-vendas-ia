import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { Sale } from '../types'

export const useSales = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('client_id', clientId)
        .in('status', ['confirmed', 'delivered'])
        .order('sale_date', { ascending: false })

      if (fetchError) throw fetchError

      const mapped: Sale[] = (data || []).map(s => ({
        id: s.id,
        clientName: s.customer_name,
        product: s.product_name,
        quantity: s.quantity || 1,
        unitPrice: s.unit_price,
        total: s.total,
        date: s.sale_date ? new Date(s.sale_date).toISOString() : new Date().toISOString(),
      }))

      setSales(mapped)
    } catch (err) {
      console.error('Error fetching sales:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar vendas')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading && clientId) {
      fetchSales()
    } else if (!clientLoading) {
      setLoading(false)
    }
  }, [clientId, clientLoading, fetchSales])

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    if (!clientId) return

    const tempId = crypto.randomUUID()
    const newSale: Sale = { id: tempId, ...sale }
    setSales(prev => [newSale, ...prev])

    try {
      const { error } = await supabase
        .from('sales')
        .insert({
          client_id: clientId,
          customer_name: sale.clientName,
          product_name: sale.product,
          quantity: sale.quantity,
          unit_price: sale.unitPrice,
          total: sale.total,
          sale_date: sale.date,
        })

      if (error) {
        console.error('Error adding sale:', error)
        fetchSales()
      }
    } catch (err) {
      console.error('Error adding sale:', err)
      fetchSales()
    }
  }

  return { sales, loading, error, addSale, refetch: fetchSales }
}
