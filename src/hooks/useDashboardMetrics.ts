import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { DashboardMetrics, ChartData } from '../types'

interface DashboardData {
  metrics: DashboardMetrics
  chartData: ChartData[]
  loading: boolean
  error: string | null
}

export const useDashboardMetrics = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [data, setData] = useState<DashboardData>({
    metrics: {
      leadsToday: 0,
      leadsMonth: 0,
      conversions: 0,
      conversionRate: 0,
      revenue: 0,
      trafficCost: 0,
      materialCost: 0,
      profit: 0,
      machineActive: true,
    },
    chartData: [],
    loading: true,
    error: null,
  })

  const fetchMetrics = useCallback(async () => {
    if (!clientId) {
      setData(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Sync com Kanban StackLab em background (fire-and-forget, não bloqueia métricas)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        fetch(`${supabaseUrl}/functions/v1/kanban-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        }).catch(() => {})
      }

      const today = new Date().toISOString().split('T')[0]
      const firstOfMonth = new Date()
      firstOfMonth.setDate(1)
      const monthStart = firstOfMonth.toISOString().split('T')[0]

      // Buscar tudo em paralelo
      const [
        { count: leadsToday },
        { count: leadsMonth },
        { data: salesData },
        { data: trafficData },
        { data: productsData },
        { data: historyData },
        { data: clientData },
      ] = await Promise.all([
        // Leads hoje (chats)
        supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .gte('created_at', today),
        // Leads no mês (chats)
        supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .gte('created_at', monthStart),
        // Vendas do mês
        supabase
          .from('sales')
          .select('total, quantity, product_id')
          .eq('client_id', clientId)
          .gte('sale_date', monthStart),
        // Custos de tráfego do mês
        supabase
          .from('traffic_costs')
          .select('spend')
          .eq('client_id', clientId)
          .gte('date', monthStart),
        // Produtos (pra calcular custo material)
        supabase
          .from('products')
          .select('id, cost')
          .eq('client_id', clientId),
        // Histórico 30 dias pro gráfico
        supabase
          .from('dashboard_metrics')
          .select('metric_date, total_leads, conversions_count, total_revenue')
          .eq('client_id', clientId)
          .order('metric_date', { ascending: true })
          .limit(30),
        // Máquina ativa
        supabase
          .from('clients')
          .select('cw_enabled')
          .eq('id', clientId)
          .single(),
      ])

      // Calcular receita
      const revenue = (salesData || []).reduce((sum, s) => sum + (s.total || 0), 0)
      const conversions = salesData?.length || 0

      // Calcular custo de tráfego
      const trafficCost = (trafficData || []).reduce((sum, t) => sum + (t.spend || 0), 0)

      // Calcular custo de materiais
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
      const totalChatsMonth = leadsMonth || 0
      const conversionRate = totalChatsMonth > 0 ? Math.round((conversions / totalChatsMonth) * 100 * 10) / 10 : 0

      const chartData: ChartData[] = (historyData || []).map(row => ({
        name: new Date(row.metric_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        vendas: row.conversions_count || 0,
        leads: row.total_leads || 0,
        receita: row.total_revenue || 0,
      }))

      setData({
        metrics: {
          leadsToday: leadsToday || 0,
          leadsMonth: totalChatsMonth,
          conversions,
          conversionRate,
          revenue,
          trafficCost,
          materialCost,
          profit,
          machineActive: clientData?.cw_enabled || false,
        },
        chartData,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err)
      setData(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao buscar métricas',
      }))
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading && clientId) {
      fetchMetrics()
    } else if (!clientLoading) {
      setData(prev => ({ ...prev, loading: false }))
    }
  }, [clientId, clientLoading, fetchMetrics])

  return { ...data, refetch: fetchMetrics }
}
