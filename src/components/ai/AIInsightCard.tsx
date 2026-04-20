import { Check, X, TrendingUp, AlertTriangle, Sparkles, Target, Activity } from 'lucide-react'
import type { AIInsight } from '@/hooks/useAIInsights'

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof TrendingUp; cssVar: string }
> = {
  tendencia:     { label: 'Tendência',    icon: TrendingUp,    cssVar: '--accent-cyan' },
  objecao:       { label: 'Objeção',      icon: AlertTriangle, cssVar: '--accent-red' },
  oportunidade:  { label: 'Oportunidade', icon: Sparkles,      cssVar: '--accent-green' },
  gargalo:       { label: 'Gargalo',      icon: Target,        cssVar: '--accent-yellow' },
  analise:       { label: 'Análise',      icon: Activity,      cssVar: '--accent-purple' },
}

const PRIORITY_STYLES: Record<string, string> = {
  alta:  'bg-red-500/10 text-red-400 border-red-500/30',
  media: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  baixa: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
}

interface Props {
  insight: AIInsight
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
  pending?: boolean
}

export default function AIInsightCard({ insight, onMarkRead, onDismiss, pending }: Props) {
  const cfg = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.analise
  const priorityClass = PRIORITY_STYLES[insight.priority] ?? PRIORITY_STYLES.media
  const Icon = cfg.icon
  const unread = !insight.is_read

  return (
    <article
      className="relative rounded-2xl border border-theme surface-card p-5 flex flex-col gap-3 transition-all duration-300 hover:brightness-105"
      style={{
        borderColor: unread
          ? `color-mix(in srgb, var(${cfg.cssVar}) var(--glow-30), transparent)`
          : undefined,
      }}
    >
      {unread && (
        <span
          className="absolute top-0 left-0 right-0 h-[1px] opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, var(${cfg.cssVar}), transparent)` }}
        />
      )}

      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{
              backgroundColor: `color-mix(in srgb, var(${cfg.cssVar}) var(--glow-10), transparent)`,
              color: `var(${cfg.cssVar})`,
            }}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: `var(${cfg.cssVar})` }}
            >
              {cfg.label}
            </p>
            <h3 className="text-sm font-semibold text-theme-primary leading-snug">{insight.title}</h3>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${priorityClass} whitespace-nowrap`}>
          {insight.priority}
        </span>
      </header>

      <p className="text-sm text-theme-secondary leading-relaxed">{insight.description}</p>

      {insight.action_items && insight.action_items.length > 0 && (
        <ul className="mt-1 space-y-1.5">
          {insight.action_items.map((item, i) => (
            <li key={i} className="flex gap-2 text-xs text-theme-tertiary leading-relaxed">
              <span className="text-theme-muted mt-0.5">▹</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      )}

      <footer className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-theme/50">
        <span className="text-[11px] text-theme-muted font-data">
          {insight.created_at
            ? new Date(insight.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            : ''}
        </span>
        <div className="flex items-center gap-1">
          {unread && (
            <button
              type="button"
              onClick={() => onMarkRead(insight.id)}
              disabled={pending}
              className="flex items-center gap-1.5 text-[11px] text-theme-tertiary hover:text-theme-primary transition px-2 py-1 rounded-lg hover:bg-white/5 disabled:opacity-50"
            >
              <Check size={12} /> Marcar lido
            </button>
          )}
          <button
            type="button"
            onClick={() => onDismiss(insight.id)}
            disabled={pending}
            className="flex items-center gap-1.5 text-[11px] text-theme-tertiary hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-white/5 disabled:opacity-50"
          >
            <X size={12} /> Dispensar
          </button>
        </div>
      </footer>
    </article>
  )
}
