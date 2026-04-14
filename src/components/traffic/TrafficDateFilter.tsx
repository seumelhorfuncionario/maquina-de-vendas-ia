import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export interface DateRange {
  from: string
  to: string
  label: string
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

function buildPresets(): { label: string; from: string; to: string }[] {
  const today = new Date()
  const todayISO = toISO(today)

  const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d) }

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  return [
    { label: 'Hoje', from: todayISO, to: todayISO },
    { label: 'Ontem', from: daysAgo(1), to: daysAgo(1) },
    { label: 'Últimos 7 dias', from: daysAgo(6), to: todayISO },
    { label: 'Últimos 14 dias', from: daysAgo(13), to: todayISO },
    { label: 'Últimos 30 dias', from: daysAgo(29), to: todayISO },
    { label: 'Este mês', from: toISO(firstOfMonth), to: todayISO },
    { label: 'Mês passado', from: toISO(lastMonth), to: toISO(lastMonthEnd) },
  ]
}

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function getDefaultDateRange(): DateRange {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return { from: toISO(firstOfMonth), to: toISO(today), label: 'Este mês' }
}

export default function TrafficDateFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState(value.from)
  const [customTo, setCustomTo] = useState(value.to)
  const ref = useRef<HTMLDivElement>(null)
  const presets = buildPresets()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectPreset = (p: typeof presets[0]) => {
    onChange({ from: p.from, to: p.to, label: p.label })
    setCustomFrom(p.from)
    setCustomTo(p.to)
    setOpen(false)
  }

  const applyCustom = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      onChange({ from: customFrom, to: customTo, label: `${customFrom.split('-').reverse().join('/')} - ${customTo.split('-').reverse().join('/')}` })
      setOpen(false)
    }
  }

  const formatLabel = (label: string) => {
    if (label.includes('-') && label.includes('/')) return label
    return label
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-theme surface-elevated text-theme-secondary hover:text-theme-primary transition-all cursor-pointer"
      >
        <Calendar size={13} style={{ color: 'var(--accent-cyan)' }} />
        {formatLabel(value.label)}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-theme surface-card shadow-xl p-3 animate-fade-in">
          <div className="space-y-0.5 mb-3">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  value.label === p.label
                    ? 'text-theme-primary'
                    : 'text-theme-muted hover:text-theme-secondary hover:bg-white/5'
                }`}
                style={value.label === p.label ? { backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)', color: 'var(--accent-cyan)' } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="border-t border-theme pt-3">
            <p className="text-[10px] font-semibold text-theme-muted uppercase tracking-widest mb-2">Personalizado</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="flex-1 px-2 py-1 rounded-md border border-theme bg-transparent text-xs text-theme-secondary outline-none focus:border-[var(--accent-cyan)]"
              />
              <span className="text-[10px] text-theme-muted">até</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="flex-1 px-2 py-1 rounded-md border border-theme bg-transparent text-xs text-theme-secondary outline-none focus:border-[var(--accent-cyan)]"
              />
            </div>
            <button
              onClick={applyCustom}
              disabled={!customFrom || !customTo || customFrom > customTo}
              className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)', color: 'var(--accent-cyan)' }}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
