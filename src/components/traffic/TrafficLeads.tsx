import { Users, MessageCircle, DollarSign, Target } from 'lucide-react'
import StatCard from '@/components/StatCard'
import TrafficCampaignTable from './TrafficCampaignTable'
import TrafficInsightCard from './TrafficInsightCard'
import TrafficCreativeRanking from './TrafficCreativeRanking'
import type { Campaign, CreativePerformance } from '@/types'
import type { TrafficInsight } from '@/types/traffic'
import { fmt, fmtNum } from '@/types/traffic'
import type { ColumnDef } from './TrafficCampaignTable'

const COLUMNS: ColumnDef[] = [
  { key: 'campaignName', label: 'Campanha', align: 'left' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'spend', label: 'Gasto', align: 'right' },
  { key: 'leads', label: 'Leads', align: 'right' },
  { key: 'costPerResult', label: 'CPL', align: 'right', render: (c) => {
    const leads = c.leads + c.messagingReplies
    const cpl = leads > 0 ? c.spend / leads : 0
    return <span className="font-data text-[13px] text-theme-secondary">{leads > 0 ? fmt(cpl) : '-'}</span>
  }},
  { key: 'messagingReplies', label: 'Mensagens', align: 'right' },
  { key: 'ctr', label: 'CTR', align: 'right' },
]

interface Props {
  campaigns: Campaign[]
  creatives: CreativePerformance[]
  insights: TrafficInsight[]
}

export default function TrafficLeads({ campaigns, creatives, insights }: Props) {
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0)
  const totalMsgs = campaigns.reduce((s, c) => s + c.messagingReplies, 0)
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const allLeads = totalLeads + totalMsgs
  const cpl = allLeads > 0 ? totalSpend / allLeads : 0

  return (
    <div className="space-y-6">
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map(i => <TrafficInsightCard key={i.id} insight={i} />)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Custo por Lead" value={allLeads > 0 ? fmt(cpl) : '-'} icon={<DollarSign size={18} />} color="neutral" stagger={1} />
        <StatCard title="Total de Leads" value={fmtNum(allLeads)} icon={<Users size={18} />} color="positive" stagger={2} />
        <StatCard title="Respostas Messenger" value={fmtNum(totalMsgs)} icon={<MessageCircle size={18} />} color="neutral" stagger={3} />
        <StatCard title="Investido" value={fmt(totalSpend)} icon={<Target size={18} />} color="yellow" stagger={4} />
      </div>

      <TrafficCampaignTable campaigns={campaigns} columns={COLUMNS} title="Campanhas de Captação" accent="--accent-green" />

      <TrafficCreativeRanking creatives={creatives} accent="--accent-green" />
    </div>
  )
}
