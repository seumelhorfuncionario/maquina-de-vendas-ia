import { Clock } from 'lucide-react'
import type { ReportStats } from '@/hooks/useReportMetrics'

interface Props {
  tempo: ReportStats['tempo_ate_agendar']
}

function formatHours(h: number | null): string {
  if (h === null) return '—'
  if (h < 1) return `${Math.round(h * 60)}min`
  if (h < 24) return `${h.toFixed(1)}h`
  return `${(h / 24).toFixed(1)}d`
}

// Com menos de MIN_SAMPLE_FOR_PCT agendamentos, P90 vira "maior tempo observado"
// em vez de percentil de verdade. MIN_SAMPLE_FULL e o patamar pra mostrar tudo
// com confianca; entre MIN e FULL mostramos so mediana com aviso.
const MIN_SAMPLE = 3
const MIN_SAMPLE_FULL = 10

export default function TimeToScheduleCard({ tempo }: Props) {
  const p50 = tempo.mediana_h
  const mean = tempo.media_h
  const p90 = tempo.p90_h
  const amostra = tempo.amostra

  const hasAny = amostra >= MIN_SAMPLE
  const hasFullConfidence = amostra >= MIN_SAMPLE_FULL

  return (
    <div className="rounded-2xl border border-theme surface-card p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} style={{ color: 'var(--accent-purple, #A855F7)' }} />
        <h3 className="text-sm font-semibold text-theme-primary">Tempo até agendamento</h3>
      </div>
      <p className="text-xs text-theme-tertiary mb-4">
        Do primeiro atendimento até a confirmação do agendamento.
      </p>

      {!hasAny ? (
        <div className="rounded-xl border border-theme px-4 py-6 text-center">
          <p className="text-xs text-theme-tertiary">
            Amostra insuficiente ({amostra} agendamentos casados por telefone) — aguarde mais dados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-theme-tertiary uppercase tracking-widest font-semibold">Mediana (P50)</p>
            <p className="text-2xl font-bold font-data" style={{ color: 'var(--accent-purple, #A855F7)' }}>
              {formatHours(p50)}
            </p>
            <p className="text-[11px] text-theme-muted">50% dos leads agendam em até este tempo</p>
          </div>

          {hasFullConfidence && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-theme/50">
              <div>
                <p className="text-[10px] text-theme-tertiary uppercase tracking-widest">Média</p>
                <p className="text-sm font-semibold font-data text-theme-primary">{formatHours(mean)}</p>
              </div>
              <div>
                <p className="text-[10px] text-theme-tertiary uppercase tracking-widest">P90</p>
                <p className="text-sm font-semibold font-data text-theme-primary">{formatHours(p90)}</p>
                <p className="text-[10px] text-theme-muted">90% agendam até</p>
              </div>
            </div>
          )}

          <p className="text-[11px] pt-2" style={{ color: hasFullConfidence ? 'var(--text-muted)' : 'var(--accent-yellow)' }}>
            Amostra: {amostra} agendamento{amostra !== 1 ? 's' : ''}
            {!hasFullConfidence && ` · amostra pequena — ${MIN_SAMPLE_FULL}+ pra média e P90 confiáveis`}
          </p>
        </div>
      )}
    </div>
  )
}
