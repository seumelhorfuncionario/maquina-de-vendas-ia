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
}

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  // Semantico (novo - green-first)
  positive: { bg: 'bg-[#00FF8815]', text: 'text-[#00FF88]', border: 'border-[#00FF8830]', glow: 'shadow-[0_0_30px_-10px_#00FF8840]' },
  warning:  { bg: 'bg-[#FFD60015]', text: 'text-[#FFD600]', border: 'border-[#FFD60030]', glow: 'shadow-[0_0_30px_-10px_#FFD60040]' },
  negative: { bg: 'bg-[#FF4D6A15]', text: 'text-[#FF4D6A]', border: 'border-[#FF4D6A30]', glow: 'shadow-[0_0_30px_-10px_#FF4D6A40]' },
  neutral:  { bg: 'bg-[#00D4FF15]', text: 'text-[#00D4FF]', border: 'border-[#00D4FF30]', glow: 'shadow-[0_0_30px_-10px_#00D4FF40]' },
  // Legacy (compatibilidade)
  blue:   { bg: 'bg-[#00D4FF15]', text: 'text-[#00D4FF]', border: 'border-[#00D4FF30]', glow: 'shadow-[0_0_30px_-10px_#00D4FF40]' },
  green:  { bg: 'bg-[#00FF8815]', text: 'text-[#00FF88]', border: 'border-[#00FF8830]', glow: 'shadow-[0_0_30px_-10px_#00FF8840]' },
  red:    { bg: 'bg-[#FF4D6A15]', text: 'text-[#FF4D6A]', border: 'border-[#FF4D6A30]', glow: 'shadow-[0_0_30px_-10px_#FF4D6A40]' },
  yellow: { bg: 'bg-[#FFD60015]', text: 'text-[#FFD600]', border: 'border-[#FFD60030]', glow: 'shadow-[0_0_30px_-10px_#FFD60040]' },
  purple: { bg: 'bg-[#A855F715]', text: 'text-[#A855F7]', border: 'border-[#A855F730]', glow: 'shadow-[0_0_30px_-10px_#A855F740]' },
}

export default function StatCard({ title, value, subtitle, icon, color = 'positive', trend }: Props) {
  const c = colorMap[color] || colorMap.positive

  return (
    <div className={`relative rounded-2xl border ${c.border} bg-[#0a0a0a] p-5 ${c.glow} transition-all duration-300 hover:brightness-110 hover:border-opacity-60`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[#888] uppercase tracking-wider">{title}</p>
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      {subtitle && <p className="text-xs text-[#555] mt-1">{subtitle}</p>}
      {trend && (
        <p className={`text-xs mt-2 font-medium ${trend.positive ? 'text-[#00FF88]' : 'text-[#FF4D6A]'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs. mes anterior
        </p>
      )}
    </div>
  )
}
