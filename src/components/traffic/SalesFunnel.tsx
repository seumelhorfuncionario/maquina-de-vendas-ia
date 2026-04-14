import { useState } from 'react'
import { Filter } from 'lucide-react'
import { useSalesFunnelData, type FunnelData } from '@/hooks/useSalesFunnelData'
import { fmt, fmtPct } from '@/types/traffic'
import type { Campaign, DashboardMetrics } from '@/types'

interface Props {
  campaigns: Campaign[]
  dashboardMetrics?: DashboardMetrics | null
  isDemo?: boolean
}

/* SVG trapezoid path: centered at cx, topWidth → bottomWidth, starting at y with height h */
function trapezoidPath(cx: number, topW: number, botW: number, y: number, h: number): string {
  const r = 6 // corner radius
  const x1 = cx - topW / 2
  const x2 = cx + topW / 2
  const x3 = cx + botW / 2
  const x4 = cx - botW / 2
  return `M${x1 + r},${y} L${x2 - r},${y} Q${x2},${y} ${x2},${y + r} L${x3},${y + h - r} Q${x3},${y + h} ${x3 - r},${y + h} L${x4 + r},${y + h} Q${x4},${y + h} ${x4},${y + h - r} L${x1},${y + r} Q${x1},${y} ${x1 + r},${y} Z`
}

const STAGE_WIDTHS = [360, 240, 140] // fixed widths for visual aesthetics
const STAGE_HEIGHT = 72
const GAP = 6
const CX = 200 // SVG center x

type HoveredStage = 'investimento' | 'contatos' | 'vendas' | null

export default function SalesFunnel({ campaigns, dashboardMetrics, isDemo }: Props) {
  const data = useSalesFunnelData(campaigns, dashboardMetrics, isDemo)
  const [hovered, setHovered] = useState<HoveredStage>(null)

  if (!data.hasData) {
    return (
      <div className="rounded-2xl border border-theme surface-card p-6 animate-card-in stagger-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-yellow) 15%, transparent), transparent)' }} />
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} style={{ color: 'var(--accent-yellow)' }} />
          <h2 className="text-base font-bold text-theme-primary tracking-tight">Funil de Vendas</h2>
        </div>
        <p className="text-sm text-theme-muted text-center py-8">Sem dados de investimento no período.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-theme surface-card p-6 animate-card-in stagger-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-yellow) 15%, transparent), transparent)' }} />

      <div className="flex items-center gap-2 mb-5">
        <Filter size={16} style={{ color: 'var(--accent-yellow)' }} />
        <h2 className="text-base font-bold text-theme-primary tracking-tight">Funil de Vendas</h2>
      </div>

      {/* SVG Funnel */}
      <div className="relative flex justify-center">
        <svg
          viewBox="0 0 400 250"
          className="w-full max-w-[420px]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {data.stages.map((stage, i) => (
              <linearGradient key={stage.key} id={`funnel-grad-${stage.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(${stage.colorVar})`} stopOpacity={hovered === stage.key ? 0.45 : 0.3} />
                <stop offset="100%" stopColor={`var(${stage.colorVar})`} stopOpacity={hovered === stage.key ? 0.2 : 0.1} />
              </linearGradient>
            ))}
          </defs>

          {data.stages.map((stage, i) => {
            const topW = STAGE_WIDTHS[i]
            const botW = STAGE_WIDTHS[i + 1] || STAGE_WIDTHS[i] * 0.65
            const y = i * (STAGE_HEIGHT + GAP)
            const isHovered = hovered === stage.key

            return (
              <g
                key={stage.key}
                className={`animate-funnel-${i + 1} cursor-pointer`}
                style={{ transformOrigin: `${CX}px ${y + STAGE_HEIGHT / 2}px` }}
                onMouseEnter={() => setHovered(stage.key as HoveredStage)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Trapezoid shape */}
                <path
                  d={trapezoidPath(CX, topW, botW, y, STAGE_HEIGHT)}
                  fill={`url(#funnel-grad-${stage.key})`}
                  stroke={`var(${stage.colorVar})`}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  strokeOpacity={isHovered ? 0.6 : 0.2}
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Label */}
                <text
                  x={CX}
                  y={y + STAGE_HEIGHT / 2 - 8}
                  textAnchor="middle"
                  fill={`var(${stage.colorVar})`}
                  fontSize="11"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="600"
                  opacity={0.8}
                >
                  {stage.label}
                </text>
                {/* Value */}
                <text
                  x={CX}
                  y={y + STAGE_HEIGHT / 2 + 12}
                  textAnchor="middle"
                  fill={`var(${stage.colorVar})`}
                  fontSize="16"
                  fontFamily="'DM Mono', monospace"
                  fontWeight="700"
                >
                  {stage.formatted}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <FunnelTooltip hovered={hovered} data={data} />
        )}
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-3 mt-6 animate-funnel-highlight">
        <div className="rounded-xl surface-elevated border border-theme p-4">
          <p className="text-[10px] font-semibold text-theme-muted uppercase tracking-widest mb-1">Faturamento Bruto</p>
          <p className="text-xl font-bold font-data" style={{ color: 'var(--accent-green)' }}>{fmt(data.highlights.faturamento)}</p>
        </div>
        <div className="rounded-xl surface-elevated border border-theme p-4">
          <p className="text-[10px] font-semibold text-theme-muted uppercase tracking-widest mb-1">Saldo Líquido</p>
          <p className="text-xl font-bold font-data" style={{ color: data.highlights.saldo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {fmt(data.highlights.saldo)}
          </p>
        </div>
      </div>

      {/* Dynamic summary */}
      <p className="text-sm text-theme-secondary leading-relaxed mt-5">
        <SummaryText data={data} />
      </p>
    </div>
  )
}

/* --- Tooltip sub-component --- */
function FunnelTooltip({ hovered, data }: { hovered: NonNullable<HoveredStage>; data: FunnelData }) {
  const { derived } = data

  const rows: { label: string; value: string }[] = []
  if (hovered === 'investimento') {
    if (derived.cpl > 0) rows.push({ label: 'Custo por Lead', value: fmt(derived.cpl) })
    if (derived.roas > 0) rows.push({ label: 'ROAS', value: `${derived.roas.toFixed(2)}x` })
  } else if (hovered === 'contatos') {
    if (derived.cpl > 0) rows.push({ label: 'Custo por Lead', value: fmt(derived.cpl) })
    rows.push({ label: 'Taxa de Conversão', value: fmtPct(derived.conversionRate) })
  } else if (hovered === 'vendas') {
    if (derived.ticketMedio > 0) rows.push({ label: 'Ticket Médio', value: fmt(derived.ticketMedio) })
    if (derived.roas > 0) rows.push({ label: 'ROAS', value: `${derived.roas.toFixed(2)}x` })
  }

  if (rows.length === 0) return null

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 ml-4 z-10 surface-elevated border border-theme rounded-xl shadow-xl p-3 animate-fade-in min-w-[160px]"
      style={{ right: '-8px', transform: 'translateX(100%) translateY(-50%)' }}>
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between gap-4 py-1">
          <span className="text-[10px] text-theme-muted whitespace-nowrap">{r.label}</span>
          <span className="text-xs font-data font-bold text-theme-primary">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

/* --- Summary text with bold values --- */
function SummaryText({ data }: { data: FunnelData }) {
  const { summaryText } = data
  // Split by fmt values (R$ ...) and numbers to make them bold
  const parts = summaryText.split(/(R\$\s?[\d.,]+|[\d.,]+\s?contatos?|1 venda)/g)
  return (
    <>
      {parts.map((part, i) =>
        /R\$|contatos?|venda/.test(part)
          ? <strong key={i} className="font-data text-theme-primary">{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}
