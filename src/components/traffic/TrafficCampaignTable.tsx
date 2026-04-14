import { useState, useMemo } from 'react'
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import Tooltip from '@/components/Tooltip'
import type { Campaign } from '@/types'
import { fmt, fmtNum, fmtPct, ctrColor, sortBy, OBJECTIVE_LABELS, OBJECTIVE_COLORS, STATUS_CONFIG, type SortDir } from '@/types/traffic'

export interface ColumnDef {
  key: keyof Campaign
  label: string
  align: 'left' | 'right' | 'center'
  tip?: string
  render?: (c: Campaign) => React.ReactNode
}

const COLUMN_TOOLTIPS: Record<string, string> = {
  spend: 'Valor total investido nesta campanha no período.',
  clicks: 'Total de cliques (todos os tipos).',
  cpc: 'Custo por Clique. Quanto custa cada clique em média.',
  ctr: 'Click-Through Rate. % de pessoas que clicaram após ver. Acima de 2% é bom.',
  cpm: 'Custo por Mil impressões. Quanto custa para 1.000 pessoas verem o anúncio.',
  impressions: 'Quantas vezes o anúncio foi exibido no total.',
  linkClicks: 'Cliques no link de destino (diferente de cliques gerais).',
  leads: 'Leads gerados: cadastros, mensagens ou formulários preenchidos.',
  messagingReplies: 'Respostas recebidas via Messenger, WhatsApp ou Instagram Direct.',
  revenue: 'Receita total gerada por vendas atribuídas a esta campanha.',
  roas: 'Return on Ad Spend. Receita / Gasto. Acima de 3x é considerado bom.',
  purchases: 'Número de compras concluídas atribuídas à campanha.',
  engagement: 'Total de interações: curtidas, comentários, compartilhamentos e reações.',
  videoViews: 'Visualizações de vídeo (3 segundos ou mais).',
  costPerResult: 'Custo médio por resultado principal da campanha.',
  objective: 'Objetivo da campanha configurado no Facebook Ads.',
  status: 'Status atual da campanha no gerenciador de anúncios.',
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'campaignName', label: 'Campanha', align: 'left' },
  { key: 'objective', label: 'Objetivo', align: 'left' },
  { key: 'spend', label: 'Gasto', align: 'right' },
  { key: 'clicks', label: 'Cliques', align: 'right' },
  { key: 'cpc', label: 'CPC', align: 'right' },
  { key: 'ctr', label: 'CTR', align: 'right' },
  { key: 'status', label: 'Status', align: 'center' },
]

interface Props {
  campaigns: Campaign[]
  columns?: ColumnDef[]
  title?: string
  accent?: string
}

export default function TrafficCampaignTable({ campaigns, columns = DEFAULT_COLUMNS, title, accent = '--accent-yellow' }: Props) {
  const [sortKey, setSortKey] = useState<keyof Campaign>('spend')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => sortBy(campaigns, sortKey, sortDir), [campaigns, sortKey, sortDir])

  const handleSort = (key: keyof Campaign) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
    if (!active) return <ArrowUpDown size={12} className="text-theme-muted ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
    return dir === 'asc'
      ? <ChevronUp size={12} className="ml-1 inline-block" style={{ color: 'var(--accent-cyan)' }} />
      : <ChevronDown size={12} className="ml-1 inline-block" style={{ color: 'var(--accent-cyan)' }} />
  }

  const renderCell = (c: Campaign, col: ColumnDef) => {
    if (col.render) return col.render(c)
    switch (col.key) {
      case 'campaignName':
        return <span className="text-sm font-medium text-theme-primary max-w-[220px] truncate block">{c.campaignName}</span>
      case 'objective': {
        const objColor = OBJECTIVE_COLORS[c.objective]
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: `color-mix(in srgb, var(${objColor}) 10%, transparent)`, color: `var(${objColor})` }}>
            {OBJECTIVE_LABELS[c.objective]}
          </span>
        )
      }
      case 'status': {
        const sc = STATUS_CONFIG[c.status]
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.status === 'ACTIVE' ? 'animate-pulse-dot' : ''}`}
              style={{ backgroundColor: sc.color }} />
            <span style={{ color: sc.color }}>{sc.label}</span>
          </span>
        )
      }
      case 'spend': case 'cpm': case 'cpc': case 'costPerResult':
        return <span className="font-data text-[13px] text-theme-secondary">{fmt(c[col.key] as number)}</span>
      case 'ctr':
        return <span className="font-data text-[13px] font-semibold" style={{ color: ctrColor(c.ctr) }}>{fmtPct(c.ctr)}</span>
      case 'roas':
        return <span className="font-data text-[13px] font-semibold" style={{ color: c.roas >= 1 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{(c.roas).toFixed(2)}x</span>
      case 'clicks': case 'impressions': case 'linkClicks': case 'videoViews': case 'engagement': case 'leads': case 'messagingReplies': case 'purchases':
        return <span className="font-data text-[13px] text-theme-secondary">{fmtNum(c[col.key] as number)}</span>
      case 'revenue':
        return <span className="font-data text-[13px]" style={{ color: 'var(--accent-green)' }}>{fmt(c.revenue)}</span>
      default:
        return <span className="text-theme-secondary text-[13px]">{String(c[col.key])}</span>
    }
  }

  return (
    <div className="rounded-2xl border border-theme surface-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, var(${accent}) 15%, transparent), transparent)` }} />

      {title && (
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-theme-primary tracking-tight">{title}</h2>
          <span className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `color-mix(in srgb, var(${accent}) 10%, transparent)`, color: `var(${accent})` }}>
            {campaigns.length}
          </span>
        </div>
      )}

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-theme">
              {columns.map(col => {
                const tip = col.tip || COLUMN_TOOLTIPS[col.key]
                return (
                  <th key={col.key}
                    className={`group pb-3 pr-4 last:pr-0 text-[10px] font-semibold text-theme-muted uppercase tracking-widest whitespace-nowrap cursor-pointer select-none ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                    onClick={() => handleSort(col.key)}>
                    {tip ? (
                      <Tooltip content={tip} position="bottom">
                        <span className="cursor-help">{col.label}</span>
                      </Tooltip>
                    ) : col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.id} className="border-b border-theme last:border-b-0 transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                {columns.map(col => (
                  <td key={col.key} className={`py-3 pr-4 last:pr-0 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}>
                    {renderCell(c, col)}
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-sm text-theme-muted">
                  Nenhuma campanha encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
