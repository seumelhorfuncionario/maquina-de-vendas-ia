import { useMemo } from 'react'
import type { Campaign } from '@/types'
import { type TrafficInsight, type ObjectiveGroup, OBJECTIVE_GROUP_MAP, fmt, fmtNum, fmtPct, groupCampaigns } from '@/types/traffic'

export function useTrafficIntelligence(campaigns: Campaign[]): TrafficInsight[] {
  return useMemo(() => {
    if (campaigns.length === 0) return []

    const insights: TrafficInsight[] = []
    const groups = groupCampaigns(campaigns)
    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)

    // --- General insights ---

    // Spend distribution
    for (const [group, camps] of Object.entries(groups) as [ObjectiveGroup, Campaign[]][]) {
      if (camps.length === 0) continue
      const groupSpend = camps.reduce((s, c) => s + c.spend, 0)
      const pct = totalSpend > 0 ? (groupSpend / totalSpend) * 100 : 0
      if (pct > 40) {
        const groupLabel = group === 'leads' ? 'captação de leads' : group === 'sales' ? 'vendas' : group === 'traffic' ? 'tráfego' : 'engajamento'
        insights.push({
          id: `alloc-${group}`,
          group: 'general',
          type: 'info',
          title: 'Concentração de investimento',
          description: `${pct.toFixed(0)}% do orçamento (${fmt(groupSpend)}) está em campanhas de ${groupLabel}.`,
          metric: { label: 'Concentração', value: `${pct.toFixed(0)}%` },
          priority: 3,
        })
      }
    }

    // --- Lead insights ---
    const leadCamps = groups.leads
    if (leadCamps.length > 0) {
      const totalLeads = leadCamps.reduce((s, c) => s + c.leads + c.messagingReplies, 0)
      const leadSpend = leadCamps.reduce((s, c) => s + c.spend, 0)
      const avgCPL = totalLeads > 0 ? leadSpend / totalLeads : 0

      if (totalLeads > 0) {
        insights.push({
          id: 'leads-cpl',
          group: 'leads',
          type: avgCPL < 30 ? 'positive' : avgCPL < 80 ? 'info' : 'warning',
          title: 'Custo por lead',
          description: `Suas campanhas geram leads a ${fmt(avgCPL)} em média. ${totalLeads} leads com ${fmt(leadSpend)} investidos.`,
          metric: { label: 'CPL médio', value: fmt(avgCPL) },
          priority: 1,
        })
      }

      // Best lead campaign
      const withLeads = leadCamps.filter(c => c.leads + c.messagingReplies > 0)
      if (withLeads.length > 1) {
        const best = withLeads.reduce((a, b) => {
          const cplA = a.spend / (a.leads + a.messagingReplies)
          const cplB = b.spend / (b.leads + b.messagingReplies)
          return cplA < cplB ? a : b
        })
        const bestCPL = best.spend / (best.leads + best.messagingReplies)
        const diff = avgCPL > 0 ? ((avgCPL - bestCPL) / avgCPL) * 100 : 0
        if (diff > 10) {
          insights.push({
            id: 'leads-best',
            group: 'leads',
            type: 'positive',
            title: 'Campanha destaque',
            description: `"${best.campaignName}" gera leads a ${fmt(bestCPL)}, ${diff.toFixed(0)}% abaixo da média. Considere escalar.`,
            metric: { label: 'CPL', value: fmt(bestCPL) },
            priority: 2,
          })
        }
      }

      // Spend without results
      const noResults = leadCamps.filter(c => c.spend > 50 && c.leads === 0 && c.messagingReplies === 0)
      for (const c of noResults) {
        insights.push({
          id: `leads-noroi-${c.id}`,
          group: 'leads',
          type: 'danger',
          title: 'Gasto sem resultado',
          description: `"${c.campaignName}" gastou ${fmt(c.spend)} sem gerar nenhum lead.`,
          metric: { label: 'Gasto', value: fmt(c.spend) },
          priority: 1,
        })
      }
    }

    // --- Traffic insights ---
    const trafCamps = groups.traffic
    if (trafCamps.length > 0) {
      const totalClicks = trafCamps.reduce((s, c) => s + c.linkClicks, 0)
      const trafSpend = trafCamps.reduce((s, c) => s + c.spend, 0)
      const avgCPC = totalClicks > 0 ? trafSpend / totalClicks : 0

      if (totalClicks > 0) {
        insights.push({
          id: 'traffic-cpc',
          group: 'traffic',
          type: avgCPC < 0.50 ? 'positive' : avgCPC < 1.50 ? 'info' : 'warning',
          title: 'Custo por clique',
          description: `Custo médio de ${fmt(avgCPC)} por clique. ${fmtNum(totalClicks)} cliques com ${fmt(trafSpend)} investidos.`,
          metric: { label: 'CPC médio', value: fmt(avgCPC) },
          priority: 1,
        })
      }

      // Best CPC campaign
      const withClicks = trafCamps.filter(c => c.linkClicks > 0)
      if (withClicks.length > 1) {
        const best = withClicks.reduce((a, b) => {
          const cpcA = a.spend / a.linkClicks
          const cpcB = b.spend / b.linkClicks
          return cpcA < cpcB ? a : b
        })
        const bestCPC = best.spend / best.linkClicks
        insights.push({
          id: 'traffic-best',
          group: 'traffic',
          type: 'positive',
          title: 'Melhor custo por clique',
          description: `"${best.campaignName}" entrega cliques a ${fmt(bestCPC)}.`,
          metric: { label: 'CPC', value: fmt(bestCPC) },
          priority: 2,
        })
      }

      // High CPC anomaly
      if (avgCPC > 0) {
        const anomalies = trafCamps.filter(c => c.linkClicks > 0 && (c.spend / c.linkClicks) > avgCPC * 2 && c.spend > 20)
        for (const c of anomalies) {
          insights.push({
            id: `traffic-cpc-high-${c.id}`,
            group: 'traffic',
            type: 'warning',
            title: 'CPC acima da média',
            description: `"${c.campaignName}" tem CPC de ${fmt(c.spend / c.linkClicks)}, mais que o dobro da média.`,
            priority: 3,
          })
        }
      }
    }

    // --- Engagement insights ---
    const engCamps = groups.engagement
    if (engCamps.length > 0) {
      const totalEng = engCamps.reduce((s, c) => s + c.engagement, 0)
      const engSpend = engCamps.reduce((s, c) => s + c.spend, 0)
      const costPerEng = totalEng > 0 ? engSpend / totalEng : 0

      if (totalEng > 0) {
        insights.push({
          id: 'eng-cost',
          group: 'engagement',
          type: costPerEng < 0.20 ? 'positive' : 'info',
          title: 'Custo por engajamento',
          description: `${fmt(costPerEng)} por interação. ${fmtNum(totalEng)} engajamentos totais.`,
          metric: { label: 'CPE', value: fmt(costPerEng) },
          priority: 1,
        })
      }
    }

    // --- Sales insights ---
    const salesCamps = groups.sales
    if (salesCamps.length > 0) {
      const totalRev = salesCamps.reduce((s, c) => s + c.revenue, 0)
      const salesSpend = salesCamps.reduce((s, c) => s + c.spend, 0)
      const roas = salesSpend > 0 ? totalRev / salesSpend : 0

      insights.push({
        id: 'sales-roas',
        group: 'sales',
        type: roas >= 3 ? 'positive' : roas >= 1 ? 'info' : 'warning',
        title: 'Retorno sobre investimento',
        description: `ROAS de ${roas.toFixed(2)}x. Para cada R$1 investido, ${fmt(roas)} retornam.`,
        metric: { label: 'ROAS', value: `${roas.toFixed(2)}x` },
        priority: 1,
      })
    }

    // --- Low CTR across all campaigns ---
    const activeLowCTR = campaigns.filter(c => c.status === 'ACTIVE' && c.ctr < 0.5 && c.spend > 30)
    for (const c of activeLowCTR) {
      insights.push({
        id: `ctr-low-${c.id}`,
        group: OBJECTIVE_GROUP_MAP[c.objective] || 'general',
        type: 'danger',
        title: 'CTR crítico',
        description: `"${c.campaignName}" está ativa com CTR de ${fmtPct(c.ctr)}. Considere pausar ou trocar criativo.`,
        priority: 1,
      })
    }

    return insights.sort((a, b) => a.priority - b.priority)
  }, [campaigns])
}
