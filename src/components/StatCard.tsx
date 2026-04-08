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

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string; accent: string }> = {
  positive: { bg: 'bg-[#00FF8810]', text: 'text-[#00FF88]', border: 'border-[#00FF8820]', glow: 'shadow-[0_0_40px_-12px_#00FF8830]', accent: '#00FF88' },
  warning:  { bg: 'bg-[#FFD60010]', text: 'text-[#FFD600]', border: 'border-[#FFD60020]', glow: 'shadow-[0_0_40px_-12px_#FFD60030]', accent: '#FFD600' },
  negative: { bg: 'bg-[#FF4D6A10]', text: 'text-[#FF4D6A]', border: 'border-[#FF4D6A20]', glow: 'shadow-[0_0_40px_-12px_#FF4D6A30]', accent: '#FF4D6A' },
  neutral:  { bg: 'bg-[#00D4FF10]', text: 'text-[#00D4FF]', border: 'border-[#00D4FF20]', glow: 'shadow-[0_0_40px_-12px_#00D4FF30]', accent: '#00D4FF' },
  blue:   { bg: 'bg-[#00D4FF10]', text: 'text-[#00D4FF]', border: 'border-[#00D4FF20]', glow: 'shadow-[0_0_40px_-12px_#00D4FF30]', accent: '#00D4FF' },
  green:  { bg: 'bg-[#00FF8810]', text: 'text-[#00FF88]', border: 'border-[#00FF8820]', glow: 'shadow-[0_0_40px_-12px_#00FF8830]', accent: '#00FF88' },
  red:    { bg: 'bg-[#FF4D6A10]', text: 'text-[#FF4D6A]', border: 'border-[#FF4D6A20]', glow: 'shadow-[0_0_40px_-12px_#FF4D6A30]', accent: '#FF4D6A' },
  yellow: { bg: 'bg-[#FFD60010]', text: 'text-[#FFD600]', border: 'border-[#FFD60020]', glow: 'shadow-[0_0_40px_-12px_#FFD60030]', accent: '#FFD600' },
  purple: { bg: 'bg-[#A855F710]', text: 'text-[#A855F7]', border: 'border-[#A855F720]', glow: 'shadow-[0_0_40px_-12px_#A855F730]', accent: '#A855F7' },
}

export default function StatCard({ title, value, subtitle, icon, color = 'positive', trend, stagger = 0 }: Props) {
  const c = colorMap[color] || colorMap.positive

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${c.border} bg-[#0a0a0a] p-5 ${c.glow} transition-all duration-300 hover:brightness-110 card-glow animate-card-in ${stagger ? `stagger-${stagger}` : ''}`}
      style={{ '--glow-color': c.accent } as React.CSSProperties}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#666] uppercase tracking-widest">{title}</p>
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold font-data ${c.text}`}>{value}</p>
      {subtitle && <p className="text-[11px] text-[#555] mt-1.5">{subtitle}</p>}
      {trend && (
        <p className={`text-[11px] mt-2 font-semibold font-data ${trend.positive ? 'text-[#00FF88]' : 'text-[#FF4D6A]'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs. mês anterior
        </p>
      )}
    </div>
  )
}
