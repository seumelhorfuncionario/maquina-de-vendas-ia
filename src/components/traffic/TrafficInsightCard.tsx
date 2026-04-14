import { Lightbulb, TrendingUp, AlertTriangle, TrendingDown, Info } from 'lucide-react'
import type { TrafficInsight } from '@/types/traffic'

const ICONS = {
  positive: TrendingUp,
  warning: AlertTriangle,
  danger: TrendingDown,
  info: Info,
}

const COLORS = {
  positive: 'var(--accent-green)',
  warning: 'var(--accent-yellow)',
  danger: 'var(--accent-red)',
  info: 'var(--accent-cyan)',
}

export default function TrafficInsightCard({ insight }: { insight: TrafficInsight }) {
  const Icon = ICONS[insight.type]
  const color = COLORS[insight.type]

  return (
    <div
      className="flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors"
      style={{
        backgroundColor: 'var(--bg-card-hover)',
        borderColor: 'var(--border)',
        borderLeftWidth: '3px',
        borderLeftColor: color,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
          color,
        }}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-theme-primary leading-tight">{insight.title}</p>
          {insight.metric && (
            <span
              className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md whitespace-nowrap"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                color,
              }}
            >
              {insight.metric.value}
            </span>
          )}
        </div>
        <p className="text-[12px] text-theme-muted mt-0.5 leading-relaxed">{insight.description}</p>
      </div>
    </div>
  )
}
