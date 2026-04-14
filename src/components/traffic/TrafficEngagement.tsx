import { Heart, Play, DollarSign, Eye } from 'lucide-react'
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
  { key: 'engagement', label: 'Engajamento', align: 'right' },
  { key: 'videoViews', label: 'Video Views', align: 'right' },
  { key: 'costPerResult', label: 'CPE', align: 'right', render: (c) => {
    const cpe = c.engagement > 0 ? c.spend / c.engagement : 0
    return <span className="font-data text-[13px] text-theme-secondary">{c.engagement > 0 ? fmt(cpe) : '-'}</span>
  }},
  { key: 'ctr', label: 'CTR', align: 'right' },
]

interface Props {
  campaigns: Campaign[]
  insights: TrafficInsight[]
}

export default function TrafficEngagement({ campaigns, insights }: Props) {
  const totalEng = campaigns.reduce((s, c) => s + c.engagement, 0)
  const totalViews = campaigns.reduce((s, c) => s + c.videoViews, 0)
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const cpe = totalEng > 0 ? totalSpend / totalEng : 0
  const cpv = totalViews > 0 ? totalSpend / totalViews : 0

  return (
    <div className="space-y-6">
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map(i => <TrafficInsightCard key={i.id} insight={i} />)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Custo/Engajamento" value={totalEng > 0 ? fmt(cpe) : '-'} icon={<Heart size={18} />} color="neutral" stagger={1} />
        <StatCard title="Engajamento Total" value={fmtNum(totalEng)} icon={<Eye size={18} />} color="positive" stagger={2} />
        <StatCard title="Video Views" value={fmtNum(totalViews)} icon={<Play size={18} />} color="neutral" stagger={3} />
        <StatCard title="Custo/View" value={totalViews > 0 ? fmt(cpv) : '-'} icon={<DollarSign size={18} />} color="yellow" stagger={4} />
      </div>

      <TrafficCampaignTable campaigns={campaigns} columns={COLUMNS} title="Campanhas de Engajamento" accent="--accent-purple" />
    </div>
  )
}
