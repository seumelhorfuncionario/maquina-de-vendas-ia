import { useState, useMemo } from 'react'
import { BarChart3, Table2, ArrowUpDown, ChevronUp, ChevronDown, Megaphone, ExternalLink } from 'lucide-react'
import Tooltip from '@/components/Tooltip'
import type { CreativePerformance } from '@/types'
import { fmt, fmtPct, ctrColor, sortBy, CLASSIFICATION_CONFIG, type SortDir } from '@/types/traffic'

type ViewMode = 'card' | 'table'

const CLASSIFICATION_TOOLTIPS: Record<string, string> = {
  winner: 'Criativo com melhor desempenho da conta. ROAS acima de 3x ou custo por resultado muito abaixo da media.',
  positive: 'Criativo com bom desempenho. Metricas acima da media da conta, vale manter e escalar.',
  neutral: 'Desempenho na media. Nao se destaca positiva nem negativamente. Monitore.',
  negative: 'Desempenho abaixo da media. Gasto alto com CTR baixo. Considere pausar ou reformular.',
  fatigue: 'Criativo em fadiga. Ja performou bem mas o publico esta saturado. Troque por variacao nova.',
}

const METRIC_TOOLTIPS: Record<string, string> = {
  spend: 'Valor total investido neste criativo no periodo.',
  clicks: 'Total de cliques recebidos (inclui todos os tipos de clique).',
  ctr: 'Click-Through Rate. Percentual de pessoas que clicaram apos ver o anuncio. Acima de 2% e bom.',
  cpc: 'Custo por Clique. Quanto voce paga em media por cada clique.',
}

interface Props {
  creatives: CreativePerformance[]
  accent?: string
}

export default function TrafficCreativeRanking({ creatives, accent = '--accent-green' }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [sortKey, setSortKey] = useState<keyof CreativePerformance>('spend')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => sortBy(creatives, sortKey, sortDir), [creatives, sortKey, sortDir])

  const handleSort = (key: keyof CreativePerformance) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
    if (!active) return <ArrowUpDown size={12} className="text-theme-muted ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
    return dir === 'asc'
      ? <ChevronUp size={12} className="ml-1 inline-block" style={{ color: 'var(--accent-cyan)' }} />
      : <ChevronDown size={12} className="ml-1 inline-block" style={{ color: 'var(--accent-cyan)' }} />
  }

  if (creatives.length === 0) return null

  const topCreatives = sorted.slice(0, 12)

  const ClassBadge = ({ classification }: { classification: string }) => {
    const cfg = CLASSIFICATION_CONFIG[classification as keyof typeof CLASSIFICATION_CONFIG] || CLASSIFICATION_CONFIG.neutral
    const tip = CLASSIFICATION_TOOLTIPS[classification] || ''
    return (
      <Tooltip content={tip}>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap cursor-help"
          style={{ backgroundColor: `color-mix(in srgb, var(${cfg.colorVar}) 12%, transparent)`, color: `var(${cfg.colorVar})` }}>
          {cfg.emoji} {cfg.label}
        </span>
      </Tooltip>
    )
  }

  const isVideo = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url)

  const adLink = (creativeId: string) => `https://www.facebook.com/ads/library/?id=${creativeId}`

  const Thumb = ({ url, name, creativeId }: { url: string | null; name: string; creativeId: string }) => {
    if (!url) return null
    const media = isVideo(url) ? (
      <video src={url} muted loop playsInline preload="metadata"
        className="w-10 h-10 rounded-lg object-cover"
        onMouseEnter={e => (e.target as HTMLVideoElement).play()}
        onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }}
      />
    ) : (
      <img src={url} alt={name} loading="lazy"
        className="w-10 h-10 rounded-lg object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
    return (
      <a href={adLink(creativeId)} target="_blank" rel="noopener noreferrer"
        className="flex-shrink-0 relative group/thumb" title="Ver no Facebook Ads">
        {media}
        <span className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <ExternalLink size={14} className="text-white" />
        </span>
      </a>
    )
  }

  return (
    <div className="rounded-2xl border border-theme surface-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, color-mix(in srgb, var(${accent}) 15%, transparent), transparent)` }} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Megaphone size={16} style={{ color: `var(${accent})` }} />
          <h2 className="text-base font-bold text-theme-primary tracking-tight">Criativos</h2>
          <span className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `color-mix(in srgb, var(${accent}) 10%, transparent)`, color: `var(${accent})` }}>
            {creatives.length}
          </span>
        </div>

        <div className="flex items-center gap-1 surface-elevated rounded-lg border border-theme p-0.5">
          <button onClick={() => setViewMode('card')} aria-pressed={viewMode === 'card'}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'card' ? 'surface-card text-theme-primary shadow-sm' : 'text-theme-muted hover:text-theme-secondary'}`}>
            <BarChart3 size={14} />
          </button>
          <button onClick={() => setViewMode('table')} aria-pressed={viewMode === 'table'}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'table' ? 'surface-card text-theme-primary shadow-sm' : 'text-theme-muted hover:text-theme-secondary'}`}>
            <Table2 size={14} />
          </button>
        </div>
      </div>

      {/* Card view */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCreatives.map(cr => {
            return (
              <div key={cr.id}
                className="rounded-xl border p-4 transition-colors"
                style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <Thumb url={cr.thumbnailUrl} name={cr.creativeName} creativeId={cr.creativeId} />
                  <div className="flex-1 min-w-0">
                    <a href={adLink(cr.creativeId)} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold text-theme-primary leading-tight truncate block hover:text-[var(--accent-cyan)] transition-colors">
                      {cr.creativeName}
                    </a>
                    {cr.adSetName && (
                      <p className="text-[10px] text-theme-muted mt-0.5 truncate">{cr.adSetName}</p>
                    )}
                  </div>
                  <ClassBadge classification={cr.classification} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Tooltip content={METRIC_TOOLTIPS.spend}>
                      <span className="text-[10px] text-theme-muted cursor-help">Gasto</span>
                    </Tooltip>
                    <span className="text-[12px] font-data text-theme-secondary block">{fmt(cr.spend)}</span>
                  </div>
                  <div>
                    <Tooltip content={METRIC_TOOLTIPS.clicks}>
                      <span className="text-[10px] text-theme-muted cursor-help">Cliques</span>
                    </Tooltip>
                    <span className="text-[12px] font-data text-theme-secondary block">{cr.clicks.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <Tooltip content={METRIC_TOOLTIPS.ctr}>
                      <span className="text-[10px] text-theme-muted cursor-help">CTR</span>
                    </Tooltip>
                    <span className="text-[12px] font-data font-semibold block" style={{ color: ctrColor(cr.ctr) }}>{fmtPct(cr.ctr)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-theme">
                <th className="pb-3 pr-4 text-[10px] font-semibold text-theme-muted uppercase tracking-widest">Criativo</th>
                {([
                  { key: 'adSetName' as keyof CreativePerformance, label: 'Conjunto', align: 'left', tip: '' },
                  { key: 'spend' as keyof CreativePerformance, label: 'Gasto', align: 'right', tip: METRIC_TOOLTIPS.spend },
                  { key: 'clicks' as keyof CreativePerformance, label: 'Cliques', align: 'right', tip: METRIC_TOOLTIPS.clicks },
                  { key: 'ctr' as keyof CreativePerformance, label: 'CTR', align: 'right', tip: METRIC_TOOLTIPS.ctr },
                  { key: 'cpc' as keyof CreativePerformance, label: 'CPC', align: 'right', tip: METRIC_TOOLTIPS.cpc },
                  { key: 'classification' as keyof CreativePerformance, label: 'Class.', align: 'center', tip: 'Classificacao automatica baseada no desempenho do criativo.' },
                ] as const).map(col => (
                  <th key={col.key}
                    className={`group pb-3 pr-4 last:pr-0 text-[10px] font-semibold text-theme-muted uppercase tracking-widest whitespace-nowrap cursor-pointer select-none ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                    onClick={() => handleSort(col.key)}>
                    {col.tip ? (
                      <Tooltip content={col.tip} position="bottom">
                        <span className="cursor-help">{col.label}</span>
                      </Tooltip>
                    ) : col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(cr => {
                return (
                  <tr key={cr.id} className="border-b border-theme last:border-b-0 transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <Thumb url={cr.thumbnailUrl} name={cr.creativeName} creativeId={cr.creativeId} />
                        <a href={adLink(cr.creativeId)} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium text-theme-primary max-w-[180px] truncate hover:text-[var(--accent-cyan)] transition-colors">
                          {cr.creativeName}
                        </a>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[12px] text-theme-muted max-w-[150px] truncate">{cr.adSetName || '-'}</td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">{fmt(cr.spend)}</td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">{cr.clicks.toLocaleString('pt-BR')}</td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] font-semibold" style={{ color: ctrColor(cr.ctr) }}>{fmtPct(cr.ctr)}</td>
                    <td className="py-3 pr-4 text-right font-data text-[13px] text-theme-secondary">{fmt(cr.cpc)}</td>
                    <td className="py-3 text-center">
                      <ClassBadge classification={cr.classification} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
