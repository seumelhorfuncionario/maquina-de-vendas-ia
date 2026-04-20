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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-theme-primary">Heatmap de Agendamentos</h3>
          <p className="text-xs text-theme-tertiary mt-0.5">Dia da semana × horário (total: {total} agendamentos)</p>
        </div>
        {max > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-theme-tertiary">
            <span>menos</span>
            <div className="flex h-2 w-24 rounded-full overflow-hidden">
              {[0.1, 0.25, 0.45, 0.7, 1].map((v) => (
                <div key={v} className="flex-1" style={{ background: `color-mix(in srgb, var(--accent-cyan) ${v * 100}%, transparent)` }} />
              ))}
            </div>
            <span>mais</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `36px repeat(${visibleHours.length}, minmax(22px, 1fr))`, gap: '2px' }}>
          <div />
          {visibleHours.map((h) => (
            <div key={h} className="text-[9px] text-theme-muted text-center font-data">
              {String(h).padStart(2, '0')}
            </div>
          ))}

          {DOW_LABELS.map((label, dow) => (
            <div key={label} className="contents">
              <div className="text-[10px] text-theme-tertiary font-semibold self-center">{label}</div>
              {visibleHours.map((h) => {
                const v = heatmap[dow]?.[h] || 0
                const int = intensity(v)
                return (
                  <div
                    key={h}
                    className="h-6 rounded-[3px] flex items-center justify-center text-[9px] font-data font-semibold transition"
                    style={{
                      background: int === 0
                        ? 'color-mix(in srgb, var(--bg-card) 60%, transparent)'
                        : `color-mix(in srgb, var(--accent-cyan) ${Math.max(12, int * 85)}%, transparent)`,
                      color: int > 0.5 ? 'var(--text-primary, #fff)' : 'var(--text-tertiary, #888)',
                      border: int === 0 ? '1px solid var(--border-theme, #2a2a2a)' : 'none',
                    }}
                    title={`${label} ${String(h).padStart(2, '0')}h: ${v} agendamento${v !== 1 ? 's' : ''}`}
                  >
                    {v > 0 ? v : ''}
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
