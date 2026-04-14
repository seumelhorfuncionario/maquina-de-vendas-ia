import { useMemo } from 'react'
import type { Campaign, DashboardMetrics } from '@/types'
import { fmt } from '@/types/traffic'

interface FunnelStage {
  key: 'investimento' | 'contatos' | 'vendas'
  label: string
  value: number
  formatted: string
  colorVar: string
}

interface FunnelDerived {
  cpl: number
  conversionRate: number
  ticketMedio: number
  roas: number
}

interface FunnelHighlights {
  faturamento: number
  saldo: number
}

export interface FunnelData {
  stages: FunnelStage[]
  derived: FunnelDerived
  highlights: FunnelHighlights
  summaryText: string
  hasData: boolean
}

export function useSalesFunnelData(
  campaigns: Campaign[],
  metrics?: DashboardMetrics | null,
  isDemo?: boolean,
): FunnelData {
  return useMemo(() => {
    // Aggregate campaign totals
    const campSpend = campaigns.reduce((s, c) => s + c.spend, 0)
    const campLeads = campaigns.reduce((s, c) => s + c.leads + c.messagingReplies, 0)
    const campPurchases = campaigns.reduce((s, c) => s + c.purchases, 0)
    const campRevenue = campaigns.reduce((s, c) => s + c.revenue, 0)

    // Prefer dashboard metrics when available (full business picture)
    const hasMetrics = !!metrics && (metrics.leadsMonth > 0 || metrics.conversions > 0 || metrics.revenue > 0)
    const spend = hasMetrics ? metrics!.trafficCost || campSpend : campSpend
    const leads = hasMetrics ? metrics!.leadsMonth : campLeads
    const sales = hasMetrics ? metrics!.conversions : campPurchases
    const revenue = hasMetrics ? metrics!.revenue : campRevenue
    const profit = hasMetrics ? metrics!.profit : campRevenue - campSpend

    const hasData = spend > 0 || leads > 0 || sales > 0

    // Derived metrics (safe division)
    const cpl = leads > 0 ? spend / leads : 0
    const conversionRate = leads > 0 ? (sales / leads) * 100 : 0
    const ticketMedio = sales > 0 ? revenue / sales : 0
    const roas = spend > 0 ? revenue / spend : 0

    // Stages
    const stages: FunnelStage[] = [
      { key: 'investimento', label: 'Investimento', value: spend, formatted: fmt(spend), colorVar: '--accent-yellow' },
      { key: 'contatos', label: 'Contatos', value: leads, formatted: leads.toLocaleString('pt-BR'), colorVar: '--accent-cyan' },
      { key: 'vendas', label: 'Vendas', value: sales, formatted: sales.toLocaleString('pt-BR'), colorVar: '--accent-green' },
    ]

    // Summary text
    let summaryText = ''
    if (!hasData) {
      summaryText = 'Sem dados de investimento no período.'
    } else if (leads === 0) {
      summaryText = `${fmt(spend)} investidos, mas nenhum contato gerado no período.`
    } else if (sales === 0) {
      summaryText = `${fmt(spend)} investidos geraram ${leads} contato${leads !== 1 ? 's' : ''}, mas nenhuma venda no período.`
    } else {
      const investPerSale = spend / sales
      const leadsPerSale = leads / sales
      summaryText = `Hoje, a cada ${fmt(investPerSale)} investidos, geramos ${leadsPerSale.toFixed(1).replace('.0', '')} contatos para realizar 1 venda de ticket médio de ${fmt(ticketMedio)}. Seu saldo final após o marketing é de ${fmt(profit)}.`
    }

    return {
      stages,
      derived: { cpl, conversionRate, ticketMedio, roas },
      highlights: { faturamento: revenue, saldo: profit },
      summaryText,
      hasData,
    }
  }, [campaigns, metrics, isDemo])
}
