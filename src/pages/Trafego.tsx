import { useState, useMemo } from 'react'
import { Loader2, Megaphone, LayoutGrid, Users, ShoppingCart, MousePointerClick, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import PageHeader from '@/components/PageHeader'
import { mockCampaigns, mockCreatives } from '@/data/mockTraffic'
import { useTrafficData } from '@/hooks/useTrafficData'
import { useTrafficIntelligence } from '@/hooks/useTrafficIntelligence'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { mockDashboard } from '@/data/mock'
import TrafficOverview from '@/components/traffic/TrafficOverview'
import TrafficLeads from '@/components/traffic/TrafficLeads'
import TrafficSales from '@/components/traffic/TrafficSales'
import TrafficTraffic from '@/components/traffic/TrafficTraffic'
import TrafficEngagement from '@/components/traffic/TrafficEngagement'
import TrafficDateFilter, { getDefaultDateRange, type DateRange } from '@/components/traffic/TrafficDateFilter'
import { type ObjectiveGroup, groupCampaigns, GROUP_CONFIG, OBJECTIVE_GROUP_MAP } from '@/types/traffic'
import type { Campaign, CreativePerformance } from '@/types'

type TabKey = 'overview' | ObjectiveGroup

const TAB_ICONS: Record<TabKey, typeof LayoutGrid> = {
  overview: LayoutGrid,
  leads: Users,
  sales: ShoppingCart,
  traffic: MousePointerClick,
  engagement: Heart,
}

export default function Trafego() {
  const { isDemo } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange)
  const hook = useTrafficData(dateRange.from, dateRange.to)
  const dashboardData = useDashboardMetrics()

  const hasRealData = !hook.loading && (hook.campaigns?.length ?? 0) > 0
  const campaigns: Campaign[] = isDemo || !hasRealData ? mockCampaigns : hook.campaigns
  const creatives: CreativePerformance[] = isDemo || !hasRealData ? mockCreatives : hook.creatives
  const loading = !isDemo && hook.loading

  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const groups = useMemo(() => groupCampaigns(campaigns), [campaigns])
  const insights = useTrafficIntelligence(campaigns)

  // Map campaign_id → ObjectiveGroup for creative filtering
  const campaignGroupMap = useMemo(() => {
    const map = new Map<string, ObjectiveGroup>()
    for (const c of campaigns) {
      map.set(c.campaignId, OBJECTIVE_GROUP_MAP[c.objective])
    }
    return map
  }, [campaigns])

  const creativesByGroup = useMemo(() => {
    const result: Record<ObjectiveGroup, CreativePerformance[]> = { leads: [], sales: [], traffic: [], engagement: [] }
    for (const cr of creatives) {
      const group = cr.campaignId ? campaignGroupMap.get(cr.campaignId) : undefined
      if (group) result[group].push(cr)
    }
    return result
  }, [creatives, campaignGroupMap])

  const availableTabs = useMemo<TabKey[]>(() => {
    const tabs: TabKey[] = ['overview']
    for (const group of ['leads', 'sales', 'traffic', 'engagement'] as ObjectiveGroup[]) {
      if (groups[group].length > 0) tabs.push(group)
    }
    return tabs
  }, [groups])

  // Reset to overview if active tab no longer available
  if (!availableTabs.includes(activeTab)) setActiveTab('overview')

  if (loading) {
    return (
      <div>
        <PageHeader title="Tráfego" description="Inteligência em campanhas Meta Ads" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
          <span className="ml-3 text-sm text-theme-muted">Carregando dados de tráfego...</span>
        </div>
      </div>
    )
  }

  const tabLabel = (tab: TabKey) => tab === 'overview' ? 'Visão Geral' : GROUP_CONFIG[tab].label

  return (
    <div className="gradient-mesh-traffic">
      <PageHeader
        title="Tráfego"
        description="Inteligência em campanhas Meta Ads"
        action={
          <div className="flex items-center gap-3">
            <TrafficDateFilter value={dateRange} onChange={setDateRange} />
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#00D4FF10] text-[#00D4FF] border border-[#00D4FF25]">
              <Megaphone size={13} />
              {campaigns.length} campanhas
            </span>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
        {availableTabs.map(tab => {
          const isActive = activeTab === tab
          const Icon = TAB_ICONS[tab]
          const colorVar = tab === 'overview' ? '--accent-cyan' : GROUP_CONFIG[tab].colorVar
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'surface-card text-theme-primary border border-theme shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary border border-transparent'
              }`}
            >
              <Icon size={15} style={isActive ? { color: `var(${colorVar})` } : undefined} />
              {tabLabel(tab)}
              {tab !== 'overview' && (
                <span className="text-[10px] font-data px-1.5 py-0.5 rounded"
                  style={isActive ? { backgroundColor: `color-mix(in srgb, var(${colorVar}) 10%, transparent)`, color: `var(${colorVar})` } : {}}>
                  {groups[tab].length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active tab content */}
      {activeTab === 'overview' && (
        <TrafficOverview
          campaigns={campaigns}
          insights={insights}
          onTabChange={tab => setActiveTab(tab)}
          dashboardMetrics={isDemo ? mockDashboard : dashboardData.metrics}
          isDemo={isDemo}
        />
      )}
      {activeTab === 'leads' && (
        <TrafficLeads campaigns={groups.leads} creatives={creativesByGroup.leads} insights={insights.filter(i => i.group === 'leads')} />
      )}
      {activeTab === 'sales' && (
        <TrafficSales campaigns={groups.sales} creatives={creativesByGroup.sales} insights={insights.filter(i => i.group === 'sales')} />
      )}
      {activeTab === 'traffic' && (
        <TrafficTraffic campaigns={groups.traffic} creatives={creativesByGroup.traffic} insights={insights.filter(i => i.group === 'traffic')} />
      )}
      {activeTab === 'engagement' && (
        <TrafficEngagement campaigns={groups.engagement} creatives={creativesByGroup.engagement} insights={insights.filter(i => i.group === 'engagement')} />
      )}
    </div>
  )
}
