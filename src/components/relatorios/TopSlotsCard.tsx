import { TrendingUp } from 'lucide-react'
import type { ReportStats } from '@/hooks/useReportMetrics'

const DOW_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface Props {
  topDowHora: ReportStats['top_dow_hora']
  valorMedio: number
}

export default function TopSlotsCard({ topDowHora, valorMedio }: Props) {
  const top5 = topDowHora.slice(0, 5)

  return (
    <div className="rounded-2xl border border-theme surface-card p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} style={{ color: 'var(--accent-green)' }} />
        <h3 className="text-sm font-semibold text-theme-primary">Melhores horários pra tráfego</h3>
      </div>
      <p className="text-xs text-theme-tertiary mb-4">
        Concentre verba nestes slots — foram os que mais geraram agendamento no período.
      </p>

      {top5.length === 0 ? (
        <div className="text-xs text-theme-tertiary text-center py-6">
          Sem agendamentos suficientes no período.
        </div>
      ) : (
        <ol className="space-y-2">
          {top5.map((slot, i) => {
            const receita = valorMedio > 0 ? slot.count * valorMedio : 0
            return (
              <li key={`${slot.dow}-${slot.hora}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-theme surface-card">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold font-data"
                  style={{
                    background: i === 0 ? 'color-mix(in srgb, var(--accent-green) 20%, transparent)' : 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)',
                    color: i === 0 ? 'var(--accent-green)' : 'var(--accent-cyan)',
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-theme-primary">
                    {DOW_FULL[slot.dow]} às {String(slot.hora).padStart(2, '0')}h
                  </p>
                  <p className="text-[11px] text-theme-tertiary">
                    {slot.count} agendamento{slot.count !== 1 ? 's' : ''}
                    {receita > 0 && ` · ~R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
