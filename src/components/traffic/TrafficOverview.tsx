import { DollarSign, TrendingUp, Zap, BarChart3, Users, ShoppingCart, MousePointerClick, Heart } from 'lucide-react'
import StatCard from '@/components/StatCard'
import TrafficInsightCard from './TrafficInsightCard'
import SalesFunnel from './SalesFunnel'
import type { Campaign, DashboardMetrics } from '@/types'
import type { TrafficInsight, ObjectiveGroup } from '@/types/traffic'
import type { FunnelAgendamentos } from '@/hooks/useSalesFunnelData'
import { fmt, fmtNum, groupCampaigns, GROUP_CONFIG } from '@/types/traffic'

const GROUP_ICONS: Record<ObjectiveGroup, typeof Users> = {
  leads: Users,
  sales: ShoppingCart,
  traffic: MousePointerClick,
  engagement: Heart,
}

interface Props {
  campaigns: Campaign[]
  insights: TrafficInsight[]
  onTabChange: (tab: ObjectiveGroup) => void
  dashboardMetrics?: DashboardMetrics | null
  isDemo?: boolean
  focuses?: string[]
  agendamentos?: FunnelAgendamentos | null
}

export default function TrafficOverview({ campaigns, insights, onTabChange, dashboardMetrics, isDemo, focuses, agendamentos }: Props) {
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const groups = groupCampaigns(campaigns)

  // Find best performing group
  const activeGroups = (Object.entries(groups) as [ObjectiveGroup, Campaign[]][]).filter(([, camps]) => camps.length > 0)
  let bestGroup: ObjectiveGroup | null = null
  let bestMetricLabel = ''
  if (activeGroups.length > 0) {
    // Simple heuristic: group with lowest cost per result
    let bestEfficiency = Infinity
    for (const [group, camps] of activeGroups) {
      const spend = camps.reduce((s, c) => s + c.spend, 0)
      const results = group === 'leads' ? camps.reduce((s, c) => s + c.leads + c.messagingReplies, 0)
        : group === 'sales' ? camps.reduce((s, c) => s + c.purchases, 0)
        : group === 'traffic' ? camps.reduce((s, c) => s + c.linkClicks, 0)
        : camps.reduce((s, c) => s + c.engagement, 0)
      const eff = results > 0 ? spend / results : Infinity
      if (eff < bestEfficiency) { bestEfficiency = eff; bestGroup = group; bestMetricLabel = results > 0 ? fmt(eff) + '/resultado' : '' }
    }
  }

  const generalInsights = insights.filter(i => i.group === 'general').slice(0, 3)
  const topInsights = insights.filter(i => i.group !== 'general').slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Global stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Investimento Total" value={fmt(totalSpend)} icon={<DollarSign size={18} />} color="yellow" stagger={1} />
        <StatCard title="Campanhas" value={fmtNum(campaigns.length)} icon={<BarChart3 size={18} />} color="neutral" stagger={2} />
        <StatCard title="Cliques Totais" value={fmtNum(totalClicks)} icon={<MousePointerClick size={18} />} color="neutral" stagger={3} />
        <StatCard
          title="Melhor Grupo"
          value={bestGroup ? GROUP_CONFIG[bestGroup].label : '-'}
          icon={<Zap size={18} />}
          color="positive"
          stagger={4}
        />
      </div>

      {/* Sales Funnel */}
      <SalesFunnel campaigns={campaigns} dashboardMetrics={dashboardMetrics} isDemo={isDemo} focuses={focuses} agendamentos={agendamentos} />

      {/* Top insights */}
      {(generalInsights.length > 0 || topInsights.length > 0) && (
        <div className="space-y-3">
          {[...generalInsights, ...topInsights].map(i => (
            <TrafficInsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}

      {/* Group summary cards — clickable to switch tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeGroups.map(([group, camps]) => {
          const Icon = GROUP_ICONS[group]
          const cfg = GROUP_CONFIG[group]
          const spend = camps.reduce((s, c) => s + c.spend, 0)
          const keyMetric = group === 'leads' ? `${fmtNum(camps.reduce((s, c) => s + c.leads + c.messagingReplies, 0))} leads`
            : group === 'sales' ? `ROAS ${(camps.reduce((s, c) => s + c.revenue, 0) / (spend || 1)).toFixed(2)}x`
            : group === 'traffic' ? `${fmtNum(camps.reduce((s, c) => s + c.linkClicks, 0))} cliques`
            : `${fmtNum(camps.reduce((s, c) => s + c.engagement, 0))} interações`

          return (
            <button
              key={group}
              onClick={() => onTabChange(group)}
              className="flex items-center gap-4 rounded-xl border border-theme surface-card p-4 text-left transition-all hover:border-[var(--accent-cyan)] cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, var(${cfg.colorVar}) 10%, transparent)`, color: `var(${cfg.colorVar})` }}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-theme-primary group-hover:text-[var(--accent-cyan)] transition-colors">{cfg.label}</p>
                <p className="text-[11px] text-theme-muted">{camps.length} campanhas · {fmt(spend)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold font-data" style={{ color: `var(${cfg.colorVar})` }}>{keyMetric}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
