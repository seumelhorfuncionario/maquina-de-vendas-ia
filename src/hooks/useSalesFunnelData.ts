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

export interface FunnelAgendamentos {
  total: number
  receita_estimada: number
}

export function useSalesFunnelData(
  campaigns: Campaign[],
  metrics?: DashboardMetrics | null,
  isDemo?: boolean,
  focuses?: string[],
  agendamentos?: FunnelAgendamentos | null,
): FunnelData {
  return useMemo(() => {
    // Aggregate campaign totals
    const campSpend = campaigns.reduce((s, c) => s + c.spend, 0)
    const campLeads = campaigns.reduce((s, c) => s + c.leads + c.messagingReplies, 0)
    const campMessagingReplies = campaigns.reduce((s, c) => s + c.messagingReplies, 0)
    const campPurchases = campaigns.reduce((s, c) => s + c.purchases, 0)
    const campRevenue = campaigns.reduce((s, c) => s + c.revenue, 0)

    const isWhatsAppLeadsMode = (focuses ?? []).includes('whatsapp_leads')

    // Modo whatsapp_leads: fonte primaria SEMPRE = campanhas Meta (ignora chats totais e sales table).
    // Contatos = conversas iniciadas pelas ads. Vendas = agendamentos do periodo. Receita = estimada.
    // Modo default (business): usa dashboard metrics quando tem vida (full funnel e-commerce/SaaS).
    const hasMetrics = !isWhatsAppLeadsMode
      && !!metrics
      && (metrics.leadsMonth > 0 || metrics.conversions > 0 || metrics.revenue > 0)

    let spend: number, leads: number, sales: number, revenue: number, profit: number
    let contatosLabel = 'Contatos'
    let vendasLabel = 'Vendas'

    if (isWhatsAppLeadsMode) {
      spend = campSpend
      leads = campMessagingReplies
      sales = agendamentos?.total ?? 0
      revenue = agendamentos?.receita_estimada ?? 0
      profit = revenue - spend
      contatosLabel = 'Conversas iniciadas'
      vendasLabel = 'Agendamentos'
    } else if (hasMetrics) {
      spend = metrics!.trafficCost || campSpend
      leads = metrics!.leadsMonth
      sales = metrics!.conversions
      revenue = metrics!.revenue
      profit = metrics!.profit
    } else {
      spend = campSpend
      leads = campLeads
      sales = campPurchases
      revenue = campRevenue
      profit = campRevenue - campSpend
    }

    const hasData = spend > 0 || leads > 0 || sales > 0

    // Derived metrics (safe division)
    const cpl = leads > 0 ? spend / leads : 0
    const conversionRate = leads > 0 ? (sales / leads) * 100 : 0
    const ticketMedio = sales > 0 ? revenue / sales : 0
    const roas = spend > 0 ? revenue / spend : 0

    // Stages
    const stages: FunnelStage[] = [
      { key: 'investimento', label: 'Investimento', value: spend, formatted: fmt(spend), colorVar: '--accent-yellow' },
      { key: 'contatos', label: contatosLabel, value: leads, formatted: leads.toLocaleString('pt-BR'), colorVar: '--accent-cyan' },
      { key: 'vendas', label: vendasLabel, value: sales, formatted: sales.toLocaleString('pt-BR'), colorVar: '--accent-green' },
    ]

    const contatoWord = contatosLabel.toLowerCase()
    const vendaWord = vendasLabel.toLowerCase().replace(/s$/, '')

    // Summary text
    let summaryText = ''
    if (!hasData) {
      summaryText = 'Sem dados de investimento no período.'
    } else if (leads === 0) {
      summaryText = `${fmt(spend)} investidos, mas nenhum${contatoWord === 'conversas iniciadas' ? 'a conversa iniciada' : ' contato'} no período.`
    } else if (sales === 0) {
      summaryText = `${fmt(spend)} investidos geraram ${leads} ${contatoWord}, mas nenhum${vendaWord === 'agendamento' ? ' agendamento' : 'a venda'} no período.`
    } else {
      const investPerSale = spend / sales
      const leadsPerSale = leads / sales
      summaryText = `A cada ${fmt(investPerSale)} investidos, geramos ${leadsPerSale.toFixed(1).replace('.0', '')} ${contatoWord} para realizar 1 ${vendaWord} de ticket médio de ${fmt(ticketMedio)}. Saldo estimado após marketing: ${fmt(profit)}.`
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
