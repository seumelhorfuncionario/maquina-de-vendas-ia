import { useMemo } from 'react'

const DOW_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface Props {
  heatmap: number[][]
  minHour?: number
  maxHour?: number
}

export default function AppointmentHeatmap({ heatmap, minHour = 7, maxHour = 21 }: Props) {
  const { max, total } = useMemo(() => {
    let m = 0
    let t = 0
    for (const row of heatmap) for (const v of row) { if (v > m) m = v; t += v }
    return { max: m, total: t }
  }, [heatmap])

  const visibleHours = HOURS.slice(minHour, maxHour + 1)

  const intensity = (v: number) => {
    if (max === 0 || v === 0) return 0
    return v / max
  }

  return (
    <div className="rounded-2xl border border-theme surface-card p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-sm font-semibold text-theme-primary">Padrão semanal de agendamentos</h3>
          <p className="text-[11px] text-theme-tertiary mt-1 leading-snug">
            Agrega os <span className="font-semibold text-theme-secondary">{total}</span> agendamentos por dia-da-semana × horário.
            Mostra o <span className="italic">padrão recorrente</span>, não a linha do tempo.
          </p>
        </div>
        {max > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-theme-muted shrink-0 mt-0.5">
            <span className="font-data tabular-nums">1</span>
            <div className="flex h-2 w-24 rounded-full overflow-hidden ring-1 ring-theme/40">
              {[0.15, 0.3, 0.5, 0.75, 1].map((v) => (
                <div key={v} className="flex-1" style={{ background: `color-mix(in srgb, var(--accent-cyan) ${v * 100}%, transparent)` }} />
              ))}
            </div>
            <span className="font-data tabular-nums">{max}+</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto mt-4">
        <div className="grid" style={{ gridTemplateColumns: `44px repeat(${visibleHours.length}, minmax(26px, 1fr))`, gap: '3px' }}>
          <div />
          {visibleHours.map((h) => (
            <div key={h} className="text-[10px] text-theme-muted text-center font-data font-semibold">
              {String(h).padStart(2, '0')}
            </div>
          ))}

          {DOW_LABELS.map((label, dow) => (
            <div key={label} className="contents">
              <div className="text-[11px] text-theme-secondary font-semibold self-center">{label}</div>
              {visibleHours.map((h) => {
                const v = heatmap[dow]?.[h] || 0
                const int = intensity(v)
                return (
                  <div
                    key={h}
                    className="h-7 rounded-[4px] flex items-center justify-center text-[11px] font-data font-bold transition"
                    style={{
                      background: int === 0
                        ? 'color-mix(in srgb, var(--text-primary, #fff) 4%, transparent)'
                        : `color-mix(in srgb, var(--accent-cyan) ${Math.max(20, int * 90)}%, transparent)`,
                      color: int > 0.5 ? 'var(--text-primary, #fff)' : int > 0 ? 'var(--text-primary, #fff)' : 'transparent',
                      border: int === 0 ? '1px solid color-mix(in srgb, var(--text-primary, #fff) 6%, transparent)' : 'none',
                    }}
                    title={`${label} ${String(h).padStart(2, '0')}h: ${v} agendamento${v !== 1 ? 's' : ''}`}
                  >
                    {v > 0 ? v : '·'}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {max === 0 && (
        <p className="text-xs text-theme-tertiary text-center mt-6 py-4">
          Nenhum agendamento no período selecionado.
        </p>
      )}
    </div>
  )
}
