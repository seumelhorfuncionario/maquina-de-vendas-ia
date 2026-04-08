import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'

export interface FinancialData {
  revenue: number
  trafficCost: number
  materialCost: number
  profit: number
  splitPartner: number // 50% do lucro para o parceiro
  splitClient: number  // 50% do lucro para o cliente
  salesCount: number
  averageTicket: number
  loading: boolean
  error: string | null
}

export const useFinanceiro = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [data, setData] = useState<FinancialData>({
    revenue: 0,
    trafficCost: 0,
    materialCost: 0,
    profit: 0,
    splitPartner: 0,
    splitClient: 0,
    salesCount: 0,
    averageTicket: 0,
    loading: true,
    error: null,
  })

  const fetchFinancials = useCallback(async () => {
    if (!clientId) {
      setData(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Buscar vendas do mes atual
      const firstOfMonth = new Date()
      firstOfMonth.setDate(1)
      const monthStart = firstOfMonth.toISOString().split('T')[0]

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total, unit_price, quantity, product_id')
        .eq('client_id', clientId)
        .gte('sale_date', monthStart)

      if (salesError) throw salesError

      // Buscar custos de trafego do mes
      const { data: trafficData, error: trafficError } = await supabase
        .from('traffic_costs')
        .select('spend')
        .eq('client_id', clientId)
        .gte('date', monthStart)

      if (trafficError) throw trafficError

      // Buscar produtos para calcular custo de materiais
      const { data: productsData } = await supabase
        .from('products')
        .select('id, cost, price')
        .eq('client_id', clientId)

      // Calcular metricas
      const revenue = (salesData || []).reduce((sum, s) => sum + (s.total || 0), 0)
      const salesCount = salesData?.length || 0
      const averageTicket = salesCount > 0 ? revenue / salesCount : 0
      const trafficCost = (trafficData || []).reduce((sum, t) => sum + (t.spend || 0), 0)

      // Custo de materiais: para cada venda, multiplicar quantidade pelo custo do produto
      const productCostMap = new Map<string, number>()
      for (const p of (productsData || [])) {
        if (p.id && p.cost) productCostMap.set(p.id, p.cost)
      }

      let materialCost = 0
      for (const sale of (salesData || [])) {
        if (sale.product_id && productCostMap.has(sale.product_id)) {
          materialCost += (productCostMap.get(sale.product_id)! * (sale.quantity || 1))
        }
      }

      const profit = revenue - trafficCost - materialCost
      const splitPartner = profit > 0 ? profit * 0.5 : 0
      const splitClient = profit > 0 ? profit * 0.5 : 0

      setData({
        revenue,
        trafficCost,
        materialCost,
        profit,
        splitPartner,
        splitClient,
        salesCount,
        averageTicket,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('Error fetching financials:', err)
      setData(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao buscar dados financeiros',
      }))
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading && clientId) {
      fetchFinancials()
    } else if (!clientLoading) {
      setData(prev => ({ ...prev, loading: false }))
    }
  }, [clientId, clientLoading, fetchFinancials])

  return { ...data, refetch: fetchFinancials }
}
