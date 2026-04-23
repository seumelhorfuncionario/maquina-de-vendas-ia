import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  presets?: number[]
}

const DEFAULT_PRESETS = [7, 15, 30, 90]

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function toInput(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function fromInput(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function rangeFromPreset(days: number): DateRange {
  const to = endOfDay(new Date())
  const from = startOfDay(new Date(Date.now() - days * 86400000))
  return { from, to }
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

function matchesPreset(range: DateRange, days: number): boolean {
  const preset = rangeFromPreset(days)
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  return sameDay(range.from, preset.from) && sameDay(range.to, preset.to)
}

function formatRange(range: DateRange): string {
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(range.from)} — ${fmt(range.to)}`
}

export default function DateRangePicker({ value, onChange, presets = DEFAULT_PRESETS }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [fromStr, setFromStr] = useState(toInput(value.from))
  const [toStr, setToStr] = useState(toInput(value.to))
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFromStr(toInput(value.from))
    setToStr(toInput(value.to))
  }, [value.from, value.to])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const activePreset = presets.find(p => matchesPreset(value, p))
  const currentLabel = activePreset ? `${activePreset}d` : formatRange(value)

  const applyCustom = () => {
    const from = startOfDay(fromInput(fromStr))
    const to = endOfDay(fromInput(toStr))
    if (from > to) return
    onChange({ from, to })
    setOpen(false)
  }

  return (
    <div className="relative" ref={popoverRef}>
      <div className="flex items-center gap-1 surface-elevated rounded-full border border-theme p-0.5">
        {presets.map(days => (
          <button
            key={days}
            onClick={() => onChange(rangeFromPreset(days))}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              activePreset === days
                ? 'surface-card text-theme-primary shadow-sm'
                : 'text-theme-muted hover:text-theme-secondary'
            }`}
          >
            {days}d
          </button>
        ))}
        <button
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
            !activePreset
              ? 'surface-card text-theme-primary shadow-sm'
              : 'text-theme-muted hover:text-theme-secondary'
          }`}
        >
          <Calendar size={12} />
          {activePreset ? 'Custom' : currentLabel}
          <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-xl border border-theme surface-card shadow-xl p-4 w-[280px]"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-widest text-theme-muted mb-3">
            Período personalizado
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-theme-muted mb-1 block font-medium">De</label>
              <input
                type="date"
                value={fromStr}
                max={toStr}
                onChange={e => setFromStr(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-theme rounded-lg px-3 py-2 text-xs text-theme-primary outline-none focus:border-[var(--accent-cyan)] transition-colors font-data"
              />
            </div>
            <div>
              <label className="text-[10px] text-theme-muted mb-1 block font-medium">Até</label>
              <input
                type="date"
                value={toStr}
                min={fromStr}
                max={toInput(new Date())}
                onChange={e => setToStr(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-theme rounded-lg px-3 py-2 text-xs text-theme-primary outline-none focus:border-[var(--accent-cyan)] transition-colors font-data"
              />
            </div>
            <div className="text-[11px] text-theme-muted font-data">
              {daysBetween(fromInput(fromStr), fromInput(toStr)) + 1} dia(s)
            </div>
            <button
              onClick={applyCustom}
              className="w-full px-3 py-2 rounded-lg bg-[var(--accent-cyan)] text-black text-xs font-semibold hover:brightness-110 transition cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function defaultRange(days = 7): DateRange {
  return rangeFromPreset(days)
}
