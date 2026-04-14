import { ShoppingCart, DollarSign, TrendingUp, Target } from 'lucide-react'
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
  { key: 'revenue', label: 'Receita', align: 'right' },
  { key: 'roas', label: 'ROAS', align: 'right' },
  { key: 'purchases', label: 'Compras', align: 'right' },
  { key: 'costPerResult', label: 'CPA', align: 'right', render: (c) => {
    const cpa = c.purchases > 0 ? c.spend / c.purchases : 0
    return <span className="font-data text-[13px] text-theme-secondary">{c.purchases > 0 ? fmt(cpa) : '-'}</span>
  }},
]

interface Props {
  campaigns: Campaign[]
  insights: TrafficInsight[]
}

export default function TrafficSales({ campaigns, insights }: Props) {
  const totalRev = campaigns.reduce((s, c) => s + c.revenue, 0)
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalPurchases = campaigns.reduce((s, c) => s + c.purchases, 0)
  const roas = totalSpend > 0 ? totalRev / totalSpend : 0
  const cpa = totalPurchases > 0 ? totalSpend / totalPurchases : 0

  return (
    <div className="space-y-6">
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map(i => <TrafficInsightCard key={i.id} insight={i} />)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="ROAS" value={`${roas.toFixed(2)}x`} icon={<TrendingUp size={18} />} color={roas >= 1 ? 'positive' : 'negative'} stagger={1} />
        <StatCard title="Receita Total" value={fmt(totalRev)} icon={<DollarSign size={18} />} color="positive" stagger={2} />
        <StatCard title="Compras" value={fmtNum(totalPurchases)} icon={<ShoppingCart size={18} />} color="neutral" stagger={3} />
        <StatCard title="Custo por Compra" value={totalPurchases > 0 ? fmt(cpa) : '-'} icon={<Target size={18} />} color="yellow" stagger={4} />
      </div>

      <TrafficCampaignTable campaigns={campaigns} columns={COLUMNS} title="Campanhas de Venda" accent="--accent-green" />
    </div>
  )
}
