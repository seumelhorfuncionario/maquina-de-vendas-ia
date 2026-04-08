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

      // Buscar metricas mais recentes do dashboard_metrics
      const { data: latestMetric, error: metricError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('client_id', clientId)
        .order('metric_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (metricError) throw metricError

      // Buscar contagem de leads hoje
      const today = new Date().toISOString().split('T')[0]
      const { count: leadsToday } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', today)

      // Buscar contagem total de leads do mes
      const firstOfMonth = new Date()
      firstOfMonth.setDate(1)
      const monthStart = firstOfMonth.toISOString().split('T')[0]
      const { count: leadsMonth } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', monthStart)

      // Buscar historico para o grafico (ultimos 30 dias)
      const { data: historyData } = await supabase
        .from('dashboard_metrics')
        .select('metric_date, total_leads, conversions_count, total_revenue')
        .eq('client_id', clientId)
        .order('metric_date', { ascending: true })
        .limit(30)

      const chartData: ChartData[] = (historyData || []).map(row => ({
        name: new Date(row.metric_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        vendas: row.conversions_count || 0,
        leads: row.total_leads || 0,
        receita: row.total_revenue || 0,
      }))

      // Verificar se Chatwoot esta ativo (maquina ativa)
      const { data: clientData } = await supabase
        .from('clients')
        .select('cw_enabled')
        .eq('id', clientId)
        .single()

      setData({
        metrics: {
          leadsToday: leadsToday || 0,
          leadsMonth: leadsMonth || 0,
          conversions: latestMetric?.conversions_count || 0,
          conversionRate: latestMetric?.conversion_rate || 0,
          revenue: latestMetric?.total_revenue || 0,
          trafficCost: 0, // Vira na Fase 5 com traffic_costs table
          materialCost: 0, // Vira na Fase 5
          profit: latestMetric?.total_revenue || 0, // Simplificado por agora
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
        error: err instanceof Error ? err.message : 'Erro ao buscar metricas',
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
