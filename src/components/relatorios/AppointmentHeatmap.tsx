import { useMemo } from 'react'

const DOW_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface Agendamento {
  data_inicio: string
}

interface Props {
  agendamentos: Agendamento[]
  dateFrom?: Date
  dateTo?: Date
  minHour?: number
  maxHour?: number
}

// Converte UTC pra BRT (GMT-3) e extrai {dateKey: 'YYYY-MM-DD', hour: 0-23, dow: 0-6}
function toBrt(iso: string) {
  const utc = new Date(iso)
  const brt = new Date(utc.getTime() - 3 * 3600000)
  const y = brt.getUTCFullYear()
  const m = String(brt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(brt.getUTCDate()).padStart(2, '0')
  return {
    dateKey: `${y}-${m}-${d}`,
    hour: brt.getUTCHours(),
    dow: brt.getUTCDay(),
    label: `${d}/${m}`,
  }
}

export default function AppointmentHeatmap({ agendamentos, dateFrom, dateTo, minHour = 7, maxHour = 21 }: Props) {
  const { rows, max, inRange, futuros } = useMemo(() => {
    const byDate = new Map<string, { label: string; dow: number; hours: number[] }>()
    let maxVal = 0
    let inRangeCount = 0
    let futurosCount = 0
    const fromKey = dateFrom ? dateFrom.toISOString().slice(0, 10) : null
    const toKey = dateTo ? dateTo.toISOString().slice(0, 10) : null
    for (const a of agendamentos) {
      if (!a.data_inicio) continue
      const { dateKey, hour, dow, label } = toBrt(a.data_inicio)
      // Filtra pro range selecionado. Futuros ficam fora do grid mas contabilizados.
      if (fromKey && dateKey < fromKey) continue
      if (toKey && dateKey > toKey) {
        futurosCount++
        continue
      }
      let row = byDate.get(dateKey)
      if (!row) {
        row = { label, dow, hours: Array(24).fill(0) }
        byDate.set(dateKey, row)
      }
      row.hours[hour]++
      inRangeCount++
      if (row.hours[hour] > maxVal) maxVal = row.hours[hour]
    }
    const sortedRows = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, row]) => ({ dateKey, ...row }))
    return { rows: sortedRows, max: maxVal, inRange: inRangeCount, futuros: futurosCount }
  }, [agendamentos, dateFrom, dateTo])

  const visibleHours = HOURS.slice(minHour, maxHour + 1)

  const intensity = (v: number) => {
    if (max === 0 || v === 0) return 0
    return v / max
  }

  return (
    <div className="rounded-2xl border border-theme surface-card p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-sm font-semibold text-theme-primary">Heatmap de Agendamentos</h3>
          <p className="text-[11px] text-theme-tertiary mt-1 leading-snug">
            <span className="font-semibold text-theme-secondary">{inRange}</span> agendamentos no período, por data e horário (BRT).
            {futuros > 0 && (
              <>
                {' '}<span className="text-[var(--accent-cyan)]">+{futuros} futuro{futuros !== 1 ? 's' : ''}</span> além da data final.
              </>
            )}
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

      {rows.length === 0 ? (
        <p className="text-xs text-theme-tertiary text-center mt-6 py-4">
          Nenhum agendamento no período selecionado.
        </p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <div className="grid" style={{ gridTemplateColumns: `88px repeat(${visibleHours.length}, minmax(32px, 1fr))`, gap: '4px' }}>
            <div />
            {visibleHours.map((h) => (
              <div key={h} className="text-[11px] text-theme-muted text-center font-data font-semibold pb-1">
                {String(h).padStart(2, '0')}h
              </div>
            ))}

            {rows.map((row) => (
              <div key={row.dateKey} className="contents">
                <div className="self-center pr-2">
                  <div className="text-[11px] font-semibold text-theme-secondary leading-tight">
                    {DOW_SHORT[row.dow]}
                  </div>
                  <div className="text-[12px] font-data font-bold text-theme-primary tabular-nums">
                    {row.label}
                  </div>
                </div>
                {visibleHours.map((h) => {
                  const v = row.hours[h] || 0
                  const int = intensity(v)
                  return (
                    <div
                      key={h}
                      className="h-9 rounded-md flex items-center justify-center text-[13px] font-data font-bold transition"
                      style={{
                        background: int === 0
                          ? 'color-mix(in srgb, var(--text-primary, #fff) 4%, transparent)'
                          : `color-mix(in srgb, var(--accent-cyan) ${Math.max(25, int * 95)}%, transparent)`,
                        color: int > 0.4 ? 'var(--text-primary, #fff)' : int > 0 ? 'var(--text-primary, #fff)' : 'color-mix(in srgb, var(--text-primary, #fff) 12%, transparent)',
                        border: int === 0 ? '1px solid color-mix(in srgb, var(--text-primary, #fff) 6%, transparent)' : 'none',
                      }}
                      title={`${DOW_SHORT[row.dow]} ${row.label} às ${String(h).padStart(2, '0')}h: ${v} agendamento${v !== 1 ? 's' : ''}`}
                    >
                      {v > 0 ? v : '·'}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
