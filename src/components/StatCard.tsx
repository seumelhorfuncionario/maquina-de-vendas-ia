import type { ReactNode } from 'react'

type SemanticColor = 'positive' | 'warning' | 'negative' | 'neutral'
type LegacyColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  color?: LegacyColor | SemanticColor
  trend?: { value: number; positive: boolean }
  stagger?: number
}

const colorMap: Record<string, string> = {
  positive: '--accent-green',
  warning: '--accent-yellow',
  negative: '--accent-red',
  neutral: '--accent-cyan',
  blue: '--accent-cyan',
  green: '--accent-green',
  red: '--accent-red',
  yellow: '--accent-yellow',
  purple: '--accent-purple',
}

export default function StatCard({ title, value, subtitle, icon, color = 'positive', trend, stagger = 0 }: Props) {
  const cssVar = colorMap[color] || colorMap.positive

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-theme surface-card p-5 transition-all duration-300 hover:brightness-105 card-glow animate-card-in ${stagger ? `stagger-${stagger}` : ''}`}
      style={{
        '--glow-color': `var(${cssVar})`,
        borderColor: `color-mix(in srgb, var(${cssVar}) var(--glow-20), transparent)`,
        boxShadow: `var(--card-shadow) color-mix(in srgb, var(${cssVar}) var(--glow-30), transparent)`,
      } as React.CSSProperties}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, var(${cssVar}), transparent)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-theme-tertiary uppercase tracking-widest">{title}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in srgb, var(${cssVar}) var(--glow-10), transparent)`,
            color: `var(${cssVar})`,
          }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold font-data" style={{ color: `var(${cssVar})` }}>{value}</p>
      {subtitle && <p className="text-[11px] text-theme-muted mt-1.5">{subtitle}</p>}
      {trend && (
        <p
          className="text-[11px] mt-2 font-semibold font-data"
          style={{ color: trend.positive ? 'var(--accent-green)' : 'var(--accent-red)' }}
        >
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs. mês anterior
        </p>
      )}
    </div>
  )
}
