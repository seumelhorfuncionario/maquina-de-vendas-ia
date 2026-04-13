import { useState, useMemo } from 'react'
import {
  DollarSign,
  Target,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Megaphone,
  Eye,
  BarChart3,
  Table2,
  Loader2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import {
  mockCampaigns,
  mockCreatives,
  mockAlerts,
  mockComparison,
  mockTrafficSummary,
} from '@/data/mockTraffic'
import { useTrafficData } from '@/hooks/useTrafficData'
import type {
  Campaign,
  CreativePerformance,
  TrafficAlert,
  TrafficComparison,
  CampaignObjective,
  CampaignStatus,
  CreativeClassification,
} from '@/types'

/* ───── Formatters ───── */
const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtNum = (v: number) => v.toLocaleString('pt-BR')

const fmtPct = (v: number) => v.toFixed(2) + '%'

/* ───── Lookup maps ───── */
const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  OUTCOME_TRAFFIC: 'Trafego',
  OUTCOME_ENGAGEMENT: 'Engajamento',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_SALES: 'Vendas',
  OUTCOME_AWARENESS: 'Alcance',
  LINK_CLICKS: 'Cliques',
  CONVERSIONS: 'Conversoes',
}

const OBJECTIVE_COLORS: Record<CampaignObjective, string> = {
  OUTCOME_TRAFFIC: '--accent-cyan',
  OUTCOME_ENGAGEMENT: '--accent-purple',
  OUTCOME_LEADS: '--accent-green',
  OUTCOME_SALES: '--accent-green',
  OUTCOME_AWARENESS: '--accent-yellow',
  LINK_CLICKS: '--accent-cyan',
  CONVERSIONS: '--accent-green',
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Ativo', color: 'var(--accent-green)' },
  PAUSED: { label: 'Pausado', color: 'var(--accent-yellow)' },
  ARCHIVED: { label: 'Arquivado', color: 'var(--text-muted)' },
  DELETED: { label: 'Excluido', color: 'var(--text-ghost)' },
}

const CLASSIFICATION_CONFIG: Record<CreativeClassification, { emoji: string; label: string; colorVar: string }> = {
  winner: { emoji: '\u{1F3C6}', label: 'Winner', colorVar: '--accent-green' },
  positive: { emoji: '\u2705', label: 'Positivo', colorVar: '--accent-green' },
  neutral: { emoji: '\u26A0\uFE0F', label: 'Neutro', colorVar: '--accent-cyan' },
  negative: { emoji: '\u{1F534}', label: 'Negativo', colorVar: '--accent-red' },
  fatigue: { emoji: '\u{1F634}', label: 'Fadiga', colorVar: '--accent-purple' },
}

type CreativeFilter = 'all' | CreativeClassification
type ViewMode = 'card' | 'table'
type SortDir = 'asc' | 'desc'

const CREATIVE_TABS: { key: CreativeFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'winner', label: '\u{1F3C6} Winners' },
  { key: 'positive', label: '\u2705 Positivos' },
  { key: 'neutral', label: '\u26A0\uFE0F Neutros' },
  { key: 'negative', label: '\u{1F534} Negativos' },
]

/* ───── Comparison value formatter ───── */
function fmtComparisonValue(v: number, format: TrafficComparison['format']): string {
  switch (format) {
    case 'currency': return fmt(v)
    case 'number': return fmtNum(v)
    case 'percent': return fmtPct(v)
    case 'multiplier': return v.toFixed(2) + 'x'
    default: return String(v)
  }
}

/* ───── CTR color helper ───── */
function ctrColor(ctr: number): string {
  if (ctr > 2) return 'var(--accent-green)'
  if (ctr >= 1) return 'var(--accent-yellow)'
  return 'var(--accent-red)'
}

/* ───── Sort helper ───── */
function sortBy<T>(arr: T[], key: keyof T, dir: SortDir): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av
    }
    return dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function Trafego() {
  const { isDemo } = useAuth()
  const hook = useTrafficData()

  /* ── Data branching ── */
  const campaigns: Campaign[] = isDemo ? mockCampaigns : (hook.campaigns ?? [])
  const creatives: CreativePerformance[] = isDemo ? mockCreatives : (hook.creatives ?? [])
  const alerts: TrafficAlert[] = isDemo ? mockAlerts : (hook.alerts ?? [])
  const comparison: TrafficComparison[] = isDemo ? mockComparison : (hook.comparison ?? [])
  const summary = isDemo ? mockTrafficSummary : (hook.summary ?? { spend: 0, revenue: 0, cpc: 0, ctr: 0 })
  const loading = !isDemo && hook.loading

  /* ── Campaign sort state ── */
  const [campSortKey, setCampSortKey] = useState<keyof Campaign>('spend')
  const [campSortDir, setCampSortDir] = useState<SortDir>('desc')

  const sortedCampaigns = useMemo(
    () => sortBy(campaigns, campSortKey, campSortDir),
    [campaigns, campSortKey, campSortDir],
  )

  const handleCampSort = (key: keyof Campaign) => {
    if (campSortKey === key) {
      setCampSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setCampSortKey(key)
      setCampSortDir('desc')
    }
  }

  /* ── Creative filter & view ── */
  const [creativeFilter, setCreativeFilter] = useState<CreativeFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  const filteredCreatives = useMemo(
    () =>
      creativeFilter === 'all'
        ? creatives
        : creatives.filter(c => c.classification === creativeFilter),
    [creatives, creativeFilter],
  )

  /* ── Creative sort (table view) ── */
  const [creativeSortKey, setCreativeSortKey] = useState<keyof CreativePerformance>('roas')
  const [creativeSortDir, setCreativeSortDir] = useState<SortDir>('desc')

  const sortedCreatives = useMemo(
    () => sortBy(filteredCreatives, creativeSortKey, creativeSortDir),
    [filteredCreatives, creativeSortKey, creativeSortDir],
  )

  const handleCreativeSort = (key: keyof CreativePerformance) => {
    if (creativeSortKey === key) {
      setCreativeSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setCreativeSortKey(key)
      setCreativeSortDir('desc')
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div>
        <PageHeader title="Trafego" description="Gestao de campanhas Meta Ads" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
          <span className="ml-3 text-sm text-theme-muted">Carregando dados de trafego...</span>
        </div>
      </div>
    )
  }

  /* ── Sort indicator helper ── */
  const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
    if (!active) return <ArrowUpDown size={12} className="text-theme-muted ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
    return dir === 'asc'
      ? <ChevronUp size={12} className="ml-1 inline-block" style={{ color: 'var(--accent-cyan)' }} />
      : <ChevronDown size={12} className="ml-1 inline-block" style={{ color: 'var(--accent-cyan)' }} />
  }

  return (
    <div className="gradient-mesh-traffic">
      <PageHeader
        title="Tráfego"
        description="Gestão de campanhas Meta Ads"
        action={
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#00D4FF10] text-[#00D4FF] border border-[#00D4FF25] animate-count-pop">
            <Megaphone size={13} />
            Meta Ads
          </span>
        }
      />

      {/* ═══ Section 1 — Summary Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Gasto Total"
          value={fmt(summary.spend)}
          icon={<DollarSign size={18} />}
          color="yellow"
          stagger={1}
        />
        <StatCard
          title="Resultado"
          value={fmt(summary.revenue)}
          icon={<TrendingUp size={18} />}
          color="positive"
          stagger={2}
        />
        <StatCard
          title="CPC Medio"
          value={fmt(summary.cpc)}
          icon={<MousePointerClick size={18} />}
          color="neutral"
          stagger={3}
        />
        <StatCard
          title="CTR"
          value={fmtPct(summary.ctr)}
          icon={<Eye size={18} />}
          color="neutral"
          stagger={4}
        />
      </div>

      {/* ═══ Section 2 — Campaign Table ═══ */}
      <div className="rounded-2xl border border-theme surface-card p-6 mb-8 animate-card-in stagger-5 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-yellow) 15%, transparent), transparent)' }}
        />

        <div className="flex items-center gap-2 mb-5">
          <Target size={16} style={{ color: 'var(--accent-yellow)' }} />
          <h2 className="text-base font-bold text-theme-primary tracking-tight">Campanhas</h2>
          <span
            className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-yellow) 10%, transparent)',
              color: 'var(--accent-yellow)',
            }}
          >
            {campaigns.length}
          </span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-theme">
                {([
                  { key: 'campaignName' as keyof Campaign, label: 'Campanha', align: 'left' },
                  { key: 'objective' as keyof Campaign, label: 'Objetivo', align: 'left' },
                  { key: 'spend' as keyof Campaign, label: 'Gasto', align: 'right' },
                  { key: 'clicks' as keyof Campaign, label: 'Cliques', align: 'right' },
                  { key: 'cpm' as keyof Campaign, label: 'CPM', align: 'right' },
                  { key: 'cpc' as keyof Campaign, label: 'CPC', align: 'right' },
                  { key: 'ctr' as keyof Campaign, label: 'CTR', align: 'right' },
                  { key: 'status' as keyof Campaign, label: 'Status', align: 'center' },
                ] as const).map(col => (
                  <th
                    key={col.key}
                    className={`group pb-3 pr-4 last:pr-0 text-[10px] font-semibold text-theme-muted uppercase tracking-widest whitespace-nowrap cursor-pointer select-none ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                    onClick={() => handleCampSort(col.key)}
                    aria-sort={campSortKey === col.key ? (campSortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {col.label}
                    <SortIcon active={campSortKey === col.key} dir={campSortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map((c, i) => {
                const statusCfg = STATUS_CONFIG[c.status]
                const objColor = OBJECTIVE_COLORS[c.objective]
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-theme last:border-b-0 transition-colors animate-row-in row-stagger-${Math.min(i + 1, 12)}`}
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="py-3 pr-4 text-sm font-medium text-theme-primary max-w-[220px] truncate">
                      {c.campaignName}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(${objColor}) 10%, transparent)`,
                          color: `var(${objColor})`,
                        }}
                      >
                        {OBJECTIVE_LABELS[c.objective]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">
                      {fmt(c.spend)}
                    </td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">
                      {fmtNum(c.clicks)}
                    </td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">
                      {fmt(c.cpm)}
                    </td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">
                      {fmt(c.cpc)}
                    </td>
                    <td
                      className="py-3 pr-4 text-right font-data text-[13px] font-semibold"
                      style={{ color: ctrColor(c.ctr) }}
                    >
                      {fmtPct(c.ctr)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.status === 'ACTIVE' ? 'animate-pulse-dot' : ''}`}
                          style={{ backgroundColor: statusCfg.color, color: statusCfg.color }}
                        />
                        <span style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                      </span>
                    </td>
                  </tr>
                )
              })}

              {sortedCampaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-theme-muted">
                    Nenhuma campanha encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Section 3 — Comparison: Hoje vs Ontem vs 7d ═══ */}
      <div className="rounded-2xl border border-theme surface-card p-6 mb-8 animate-card-in stagger-6 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-cyan) 15%, transparent), transparent)' }}
        />

        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h2 className="text-base font-bold text-theme-primary tracking-tight">Comparativo de Periodo</h2>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-theme">
                <th className="pb-3 pr-4 text-[10px] font-semibold text-theme-muted uppercase tracking-widest">Metrica</th>
                <th className="pb-3 pr-4 text-right text-[10px] font-semibold text-theme-muted uppercase tracking-widest">Hoje</th>
                <th className="pb-3 pr-4 text-right text-[10px] font-semibold text-theme-muted uppercase tracking-widest">Ontem</th>
                <th className="pb-3 pr-4 text-right text-[10px] font-semibold text-theme-muted uppercase tracking-widest">Media 7d</th>
                <th className="pb-3 pr-4 text-right text-[10px] font-semibold text-theme-muted uppercase tracking-widest">vs Ontem</th>
                <th className="pb-3 text-right text-[10px] font-semibold text-theme-muted uppercase tracking-widest">vs 7d</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(row => {
                const vsYesterday = row.todayVsYesterday
                const vs7d = row.todayVsLast7d
                return (
                  <tr
                    key={row.metric}
                    className="border-b border-theme last:border-b-0 transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="py-3 pr-4 text-sm font-medium text-theme-primary">{row.label}</td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">
                      {fmtComparisonValue(row.today, row.format)}
                    </td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-muted">
                      {fmtComparisonValue(row.yesterday, row.format)}
                    </td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-muted">
                      {fmtComparisonValue(row.last7d, row.format)}
                    </td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] font-semibold">
                      <span
                        className="inline-flex items-center gap-0.5"
                        style={{
                          color: row.metric === 'spend'
                            ? (vsYesterday > 0 ? 'var(--accent-red)' : 'var(--accent-green)')
                            : (vsYesterday >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'),
                        }}
                      >
                        {vsYesterday >= 0
                          ? <TrendingUp size={12} />
                          : <TrendingDown size={12} />}
                        {Math.abs(vsYesterday).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-data text-[13px] font-semibold">
                      <span
                        className="inline-flex items-center gap-0.5"
                        style={{
                          color: row.metric === 'spend'
                            ? (vs7d > 0 ? 'var(--accent-red)' : 'var(--accent-green)')
                            : (vs7d >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'),
                        }}
                      >
                        {vs7d >= 0
                          ? <TrendingUp size={12} />
                          : <TrendingDown size={12} />}
                        {Math.abs(vs7d).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}

              {comparison.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-theme-muted">
                    Sem dados comparativos disponiveis
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Section 4 — Creative Ranking ═══ */}
      <div className="rounded-2xl border border-theme surface-card p-6 mb-8 animate-card-in stagger-7 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-green) 15%, transparent), transparent)' }}
        />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Megaphone size={16} style={{ color: 'var(--accent-green)' }} />
            <h2 className="text-base font-bold text-theme-primary tracking-tight">Ranking de Criativos</h2>
            <span
              className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-green) 10%, transparent)',
                color: 'var(--accent-green)',
              }}
            >
              {filteredCreatives.length}
            </span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 surface-elevated rounded-lg border border-theme p-0.5">
            <button
              onClick={() => setViewMode('card')}
              aria-pressed={viewMode === 'card'}
              aria-label="Visualizacao em cards"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'surface-card text-theme-primary shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              <BarChart3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              aria-label="Visualizacao em tabela"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'surface-card text-theme-primary shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              <Table2 size={14} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {CREATIVE_TABS.map(tab => {
            const isActive = creativeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setCreativeFilter(tab.key)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'surface-card text-theme-primary border border-theme shadow-sm'
                    : 'text-theme-muted hover:text-theme-secondary border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Card view */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCreatives.map((cr, i) => {
              const cfg = CLASSIFICATION_CONFIG[cr.classification]
              const roasWidth = Math.min((cr.roas / 5) * 100, 100)
              const isWinner = cr.classification === 'winner'
              return (
                <div
                  key={cr.id}
                  className={`rounded-xl border p-4 card-hover-lift animate-card-in stagger-${Math.min(i + 1, 12)} ${isWinner ? 'animate-winner-glow' : ''}`}
                  style={{
                    '--glow-color': `var(${cfg.colorVar})`,
                    backgroundColor: 'var(--bg-card-hover)',
                    borderColor: isWinner
                      ? `color-mix(in srgb, var(--accent-green) 40%, transparent)`
                      : 'var(--border)',
                    boxShadow: isWinner
                      ? '0 0 24px -8px color-mix(in srgb, var(--accent-green) 20%, transparent)'
                      : 'none',
                  } as React.CSSProperties}
                >
                  {/* Name + badge */}
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-semibold text-theme-primary leading-tight pr-2 truncate flex-1">
                      {cr.creativeName}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${isWinner ? 'animate-shimmer' : ''}`}
                      style={{
                        backgroundColor: `color-mix(in srgb, var(${cfg.colorVar}) 12%, transparent)`,
                        color: `var(${cfg.colorVar})`,
                      }}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>

                  {/* ROAS bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-theme-muted font-medium">ROAS</span>
                      <span
                        className="text-[12px] font-bold font-data"
                        style={{ color: `var(${cfg.colorVar})` }}
                      >
                        {cr.roas.toFixed(2)}x
                      </span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--text-ghost) 30%, transparent)' }}
                    >
                      <div
                        className="h-full rounded-full animate-bar-fill"
                        style={{
                          width: `${roasWidth}%`,
                          backgroundColor: `var(${cfg.colorVar})`,
                          animationDelay: `${0.3 + i * 0.08}s`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Spend + Revenue */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-theme-muted block">Gasto</span>
                      <span className="text-[13px] font-data text-theme-secondary">{fmt(cr.spend)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-theme-muted block">Receita</span>
                      <span className="text-[13px] font-data" style={{ color: 'var(--accent-green)' }}>
                        {fmt(cr.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredCreatives.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-theme-muted">
                Nenhum criativo encontrado para este filtro
              </div>
            )}
          </div>
        )}

        {/* Table view */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-theme">
                  {([
                    { key: 'creativeName' as keyof CreativePerformance, label: 'Criativo', align: 'left' },
                    { key: 'spend' as keyof CreativePerformance, label: 'Gasto', align: 'right' },
                    { key: 'revenue' as keyof CreativePerformance, label: 'Receita', align: 'right' },
                    { key: 'roas' as keyof CreativePerformance, label: 'ROAS', align: 'right' },
                    { key: 'ctr' as keyof CreativePerformance, label: 'CTR', align: 'right' },
                    { key: 'cpc' as keyof CreativePerformance, label: 'CPC', align: 'right' },
                    { key: 'classification' as keyof CreativePerformance, label: 'Class.', align: 'center' },
                  ] as const).map(col => (
                    <th
                      key={col.key}
                      className={`group pb-3 pr-4 last:pr-0 text-[10px] font-semibold text-theme-muted uppercase tracking-widest whitespace-nowrap cursor-pointer select-none ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                      onClick={() => handleCreativeSort(col.key)}
                      aria-sort={creativeSortKey === col.key ? (creativeSortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {col.label}
                      <SortIcon active={creativeSortKey === col.key} dir={creativeSortDir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCreatives.map(cr => {
                  const cfg = CLASSIFICATION_CONFIG[cr.classification]
                  return (
                    <tr
                      key={cr.id}
                      className="border-b border-theme last:border-b-0 transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td className="py-3 pr-4 text-sm font-medium text-theme-primary max-w-[200px] truncate">
                        {cr.creativeName}
                      </td>
                      <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">
                        {fmt(cr.spend)}
                      </td>
                      <td className="py-3 pr-4 text-right font-data text-[13px]" style={{ color: 'var(--accent-green)' }}>
                        {fmt(cr.revenue)}
                      </td>
                      <td
                        className="py-3 pr-4 text-right font-data text-[13px] font-semibold"
                        style={{ color: `var(${cfg.colorVar})` }}
                      >
                        {cr.roas.toFixed(2)}x
                      </td>
                      <td
                        className="py-3 pr-4 text-right font-data text-[13px] font-semibold"
                        style={{ color: ctrColor(cr.ctr) }}
                      >
                        {fmtPct(cr.ctr)}
                      </td>
                      <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">
                        {fmt(cr.cpc)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: `color-mix(in srgb, var(${cfg.colorVar}) 12%, transparent)`,
                            color: `var(${cfg.colorVar})`,
                          }}
                        >
                          {cfg.emoji} {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {sortedCreatives.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-theme-muted">
                      Nenhum criativo encontrado para este filtro
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ Section 5 — Alerts ═══ */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-theme surface-card p-6 animate-card-in stagger-8 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-red) 15%, transparent), transparent)' }}
          />

          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={16} style={{ color: 'var(--accent-red)' }} />
            <h2 className="text-base font-bold text-theme-primary tracking-tight">Alertas de Trafego</h2>
            <span
              className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-red) 10%, transparent)',
                color: 'var(--accent-red)',
              }}
            >
              {alerts.length}
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, idx) => {
              const isDanger = alert.severity === 'danger'
              const borderColor = isDanger ? 'var(--accent-red)' : 'var(--accent-yellow)'
              const Icon = isDanger ? TrendingDown : AlertTriangle
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors animate-row-in row-stagger-${Math.min(idx + 1, 4)} animate-alert-pulse`}
                  style={{
                    '--alert-color': borderColor,
                    backgroundColor: 'var(--bg-card-hover)',
                    borderColor: 'var(--border)',
                    borderLeftWidth: '3px',
                    borderLeftColor: borderColor,
                  } as React.CSSProperties}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${borderColor} 10%, transparent)`,
                      color: borderColor,
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-theme-primary leading-tight">{alert.title}</p>
                    <p className="text-[12px] text-theme-muted mt-0.5 leading-relaxed">{alert.description}</p>
                    {alert.campaignName && (
                      <span
                        className="inline-block text-[10px] font-data font-medium mt-1.5 px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 8%, transparent)',
                          color: 'var(--accent-cyan)',
                        }}
                      >
                        {alert.campaignName}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
