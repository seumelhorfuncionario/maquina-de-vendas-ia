import { MousePointerClick, Eye, DollarSign, BarChart3 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import TrafficCampaignTable from './TrafficCampaignTable'
import TrafficInsightCard from './TrafficInsightCard'
import type { Campaign } from '@/types'
import type { TrafficInsight } from '@/types/traffic'
import { fmt, fmtNum } from '@/types/traffic'
import type { ColumnDef } from './TrafficCampaignTable'

const COLUMNS: ColumnDef[] = [
  { key: 'campaignName', label: 'Campanha', align: 'left' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'spend', label: 'Gasto', align: 'right' },
  { key: 'linkClicks', label: 'Cliques', align: 'right' },
  { key: 'cpc', label: 'CPC', align: 'right' },
  { key: 'ctr', label: 'CTR', align: 'right' },
  { key: 'cpm', label: 'CPM', align: 'right' },
  { key: 'impressions', label: 'Impressoes', align: 'right' },
]

interface Props {
  campaigns: Campaign[]
  insights: TrafficInsight[]
}

export default function TrafficTraffic({ campaigns, insights }: Props) {
  const totalClicks = campaigns.reduce((s, c) => s + c.linkClicks, 0)
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0

  return (
    <div className="space-y-6">
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map(i => <TrafficInsightCard key={i.id} insight={i} />)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Custo por Clique" value={fmt(cpc)} icon={<MousePointerClick size={18} />} color="neutral" stagger={1} />
        <StatCard title="Total de Cliques" value={fmtNum(totalClicks)} icon={<BarChart3 size={18} />} color="positive" stagger={2} />
        <StatCard title="Impressoes" value={fmtNum(totalImpressions)} icon={<Eye size={18} />} color="neutral" stagger={3} />
        <StatCard title="CPM Medio" value={fmt(cpm)} icon={<DollarSign size={18} />} color="yellow" stagger={4} />
      </div>

      <TrafficCampaignTable campaigns={campaigns} columns={COLUMNS} title="Campanhas de Trafego" accent="--accent-cyan" />
    </div>
  )
}
