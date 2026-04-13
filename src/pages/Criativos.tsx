import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Palette,
  Calendar,
  List,
  Eye,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Image,
  Film,
  Layers,
  Play,
  Instagram,
  Facebook,
  Loader2,
  FileText,
  Send,
  ArrowLeft,
  Columns3,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import { mockContentPosts } from '../data/mockContent'
import { useContentPosts } from '../hooks/useContentPosts'
import type { ContentPost, ContentStatus, ContentType, ContentPlatform } from '../types'

/* ──────────────────────────── Config Maps ──────────────────────────── */

const statusConfig: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Rascunho', color: 'var(--text-muted)', bg: 'color-mix(in srgb, var(--text-muted) 15%, transparent)' },
  review: { label: 'Para Revisão', color: 'var(--accent-yellow)', bg: 'color-mix(in srgb, var(--accent-yellow) 15%, transparent)' },
  approved: { label: 'Aprovado', color: 'var(--accent-green)', bg: 'color-mix(in srgb, var(--accent-green) 15%, transparent)' },
  published: { label: 'Publicado', color: 'var(--accent-cyan)', bg: 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)' },
}

const typeConfig: Record<ContentType, { icon: typeof Image; label: string }> = {
  image: { icon: Image, label: 'Imagem' },
  video: { icon: Film, label: 'Vídeo' },
  carousel: { icon: Layers, label: 'Carrossel' },
  story: { icon: Play, label: 'Story' },
  reel: { icon: Play, label: 'Reel' },
}

const platformConfig: Record<ContentPlatform, { label: string }> = {
  instagram: { label: 'Instagram' },
  facebook: { label: 'Facebook' },
  tiktok: { label: 'TikTok' },
  linkedin: { label: 'LinkedIn' },
}

type FilterTab = 'all' | ContentStatus

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'review', label: 'Para Revisão' },
  { key: 'approved', label: 'Aprovados' },
  { key: 'published', label: 'Publicados' },
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/* ──────────────────────────── Helpers ──────────────────────────── */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

interface CalendarCell {
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
}

function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

  const cells: CalendarCell[] = []

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, isCurrentMonth: true })
  }

  // Next month leading days (fill to 42 cells = 6 rows)
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({ day: nextDay++, month: nextMonth, year: nextYear, isCurrentMonth: false })
  }

  return cells
}

function formatScheduledDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function PlatformIcon({ platform, size = 13 }: { platform: ContentPlatform; size?: number }) {
  if (platform === 'instagram') return <Instagram size={size} />
  if (platform === 'facebook') return <Facebook size={size} />
  if (platform === 'tiktok') {
    return (
      <span
        className="inline-flex items-center justify-center font-bold leading-none"
        style={{ fontSize: size * 0.75, width: size, height: size }}
      >
        TT
      </span>
    )
  }
  // linkedin
  return (
    <span
      className="inline-flex items-center justify-center font-bold leading-none"
      style={{ fontSize: size * 0.75, width: size, height: size }}
    >
      in
    </span>
  )
}

function ContentTypeIcon({ contentType, size = 13 }: { contentType: ContentType; size?: number }) {
  const cfg = typeConfig[contentType]
  const Icon = cfg.icon
  return <Icon size={size} />
}

/* ──────────────────────────── Post Detail Modal ──────────────────────────── */

function PostDetailModal({
  post,
  onClose,
  onStatusChange,
  onImagePreview,
}: {
  post: ContentPost
  onClose: () => void
  onStatusChange: (postId: string, newStatus: ContentStatus, notes?: string) => void
  onImagePreview: (url: string | null) => void
}) {
  const [localNotes, setLocalNotes] = useState(post.notes || '')
  const cfg = statusConfig[post.status]
  const typeCfg = typeConfig[post.contentType]

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleAction = (newStatus: ContentStatus) => {
    onStatusChange(post.id, newStatus, localNotes || undefined)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop"
      onClick={onClose}
    >
      <div
        className="surface-card border border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1.5 rounded-lg surface-elevated hover:brightness-125 text-theme-muted hover:text-theme-primary transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Media preview */}
          {(post.mediaUrl || post.thumbnailUrl) && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={post.mediaUrl || post.thumbnailUrl || ''}
                alt={post.title}
                className="w-full max-h-[300px] object-cover cursor-pointer hover:brightness-110 transition-all"
                onClick={() => onImagePreview(post.mediaUrl || post.thumbnailUrl)}
              />
            </div>
          )}

          {/* Title */}
          <h2 className="text-lg font-extrabold text-theme-primary tracking-tight pr-10 mb-3">
            {post.title}
          </h2>

          {/* Platform + Type + Status badges */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-purple) 15%, transparent)', color: 'var(--accent-purple)' }}
            >
              <PlatformIcon platform={post.platform} size={12} />
              {platformConfig[post.platform].label}
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)', color: 'var(--accent-cyan)' }}
            >
              <ContentTypeIcon contentType={post.contentType} size={12} />
              {typeCfg.label}
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Caption */}
          {post.caption && (
            <div
              className="rounded-xl p-4 mb-5 text-sm text-theme-secondary leading-relaxed whitespace-pre-wrap"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderLeft: `3px solid ${cfg.color}`,
              }}
            >
              {post.caption}
            </div>
          )}

          {/* Scheduled date */}
          <div className="flex items-center gap-2 mb-4 text-sm text-theme-muted">
            <Calendar size={14} />
            <span className="font-medium">Agendado:</span>
            <span className="font-data text-theme-secondary">{formatScheduledDate(post.scheduledDate)}</span>
          </div>

          {/* Published at (if published) */}
          {post.publishedAt && (
            <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--accent-cyan)' }}>
              <Check size={14} />
              <span className="font-medium">Publicado em:</span>
              <span className="font-data">{formatDateTime(post.publishedAt)}</span>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--accent-purple) 10%, transparent)',
                    color: 'var(--accent-purple)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Notes textarea */}
          <div className="mb-5">
            <label className="text-[11px] text-theme-muted mb-1.5 block font-medium">Observações</label>
            <textarea
              value={localNotes}
              onChange={e => setLocalNotes(e.target.value)}
              placeholder="Adicione observações sobre este conteúdo..."
              rows={3}
              className="w-full bg-[var(--bg-elevated)] border border-theme rounded-xl px-3 py-2 text-sm text-theme-primary outline-none focus:border-[#00D4FF] transition-colors resize-none"
            />
          </div>

          {/* Status action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-theme">
            {post.status === 'draft' && (
              <button
                onClick={() => handleAction('review')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent-yellow) 20%, transparent)', color: 'var(--accent-yellow)' }}
              >
                <Send size={14} />
                Enviar para Revisão
              </button>
            )}

            {post.status === 'review' && (
              <>
                <button
                  onClick={() => handleAction('approved')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00FF88] hover:bg-[#00cc6e] text-black text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Check size={14} />
                  Aprovar
                </button>
                <button
                  onClick={() => handleAction('draft')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl surface-elevated border border-theme text-theme-secondary text-sm font-semibold hover:text-theme-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Voltar para Rascunho
                </button>
              </>
            )}

            {post.status === 'approved' && (
              <>
                <button
                  onClick={() => handleAction('published')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 20%, transparent)', color: 'var(--accent-cyan)' }}
                >
                  <Check size={14} />
                  Marcar como Publicado
                </button>
                <button
                  onClick={() => handleAction('review')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl surface-elevated border border-theme text-sm font-semibold transition-colors cursor-pointer"
                  style={{ color: 'var(--accent-yellow)' }}
                >
                  <ArrowLeft size={14} />
                  Voltar para Revisão
                </button>
              </>
            )}

            {post.status === 'published' && post.publishedAt && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: 'var(--accent-cyan)' }}>
                <Check size={14} />
                Publicado em {formatDateTime(post.publishedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── Main Component ──────────────────────────── */

export default function Criativos() {
  const { isDemo } = useAuth()
  const hook = useContentPosts()

  const [localPosts, setLocalPosts] = useState<ContentPost[]>(mockContentPosts)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar' | 'list'>('kanban')
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Calendar navigation — default to current month
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())

  // Source of truth
  const posts: ContentPost[] = isDemo ? localPosts : (hook.posts || [])
  const loading = !isDemo && hook.loading

  // Filtered posts
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return posts
    return posts.filter(p => p.status === activeFilter)
  }, [posts, activeFilter])

  // Count per status
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: posts.length }
    for (const p of posts) {
      map[p.status] = (map[p.status] || 0) + 1
    }
    return map
  }, [posts])

  // Calendar grid
  const calendarCells = useMemo(() => buildCalendarGrid(currentYear, currentMonth), [currentYear, currentMonth])

  // Posts grouped by date string for calendar
  const postsByDate = useMemo(() => {
    const map = new Map<string, ContentPost[]>()
    for (const p of filteredPosts) {
      if (!p.scheduledDate) continue
      const dateKey = p.scheduledDate.slice(0, 10)
      const arr = map.get(dateKey) || []
      arr.push(p)
      map.set(dateKey, arr)
    }
    return map
  }, [filteredPosts])

  // Month navigation
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1)
        return 0
      }
      return prev + 1
    })
  }, [])

  // Status change handler
  const handleStatusChange = useCallback((postId: string, newStatus: ContentStatus, notes?: string) => {
    if (isDemo) {
      setLocalPosts(prev =>
        prev.map(p => {
          if (p.id !== postId) return p
          const updated: ContentPost = { ...p, status: newStatus, notes: notes ?? p.notes }
          if (newStatus === 'approved') updated.approvedAt = new Date().toISOString()
          if (newStatus === 'published') updated.publishedAt = new Date().toISOString()
          return updated
        })
      )
      setSelectedPost(prev => {
        if (!prev || prev.id !== postId) return prev
        const updated: ContentPost = { ...prev, status: newStatus, notes: notes ?? prev.notes }
        if (newStatus === 'approved') updated.approvedAt = new Date().toISOString()
        if (newStatus === 'published') updated.publishedAt = new Date().toISOString()
        return updated
      })
    } else {
      hook.updatePostStatus(postId, newStatus, notes)
      // Re-sync selected post after update
      setSelectedPost(prev => {
        if (!prev || prev.id !== postId) return prev
        const updated: ContentPost = { ...prev, status: newStatus, notes: notes ?? prev.notes }
        if (newStatus === 'approved') updated.approvedAt = new Date().toISOString()
        if (newStatus === 'published') updated.publishedAt = new Date().toISOString()
        return updated
      })
    }
  }, [isDemo, hook])

  // Keep selectedPost in sync with posts array (for hook refetches)
  useEffect(() => {
    if (!selectedPost) return
    const fresh = posts.find(p => p.id === selectedPost.id)
    if (fresh && fresh.status !== selectedPost.status) {
      setSelectedPost(fresh)
    }
  }, [posts, selectedPost])

  /* ──────── Loading state ──────── */
  if (loading) {
    return (
      <div>
        <PageHeader title="Criativos" description="Calendário editorial e aprovação de conteúdo" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
          <span className="ml-3 text-sm text-theme-muted">Carregando conteúdos...</span>
        </div>
      </div>
    )
  }

  /* ──────── Today helper ──────── */
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="gradient-mesh-creatives">
      <PageHeader
        title="Criativos"
        description="Calendário editorial e aprovação de conteúdo"
        action={
          <div className="flex items-center gap-2">
            <Palette size={16} style={{ color: 'var(--accent-purple)' }} />
            <span
              className="text-[11px] font-bold font-data px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-purple) 10%, transparent)', color: 'var(--accent-purple)' }}
            >
              {posts.length} conteúdos
            </span>
          </div>
        }
      />

      {/* ──────── Filter tabs + View toggle ──────── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {FILTER_TABS.map(tab => {
            const isActive = activeFilter === tab.key
            const count = counts[tab.key] || 0
            const tabColor = tab.key === 'all'
              ? 'var(--accent-cyan)'
              : statusConfig[tab.key as ContentStatus]?.color || 'var(--accent-cyan)'

            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                aria-pressed={isActive}
                aria-label={`Filtrar: ${tab.label}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'border'
                    : 'surface-elevated text-theme-muted hover:text-theme-secondary border border-transparent'
                }`}
                style={isActive ? {
                  backgroundColor: `color-mix(in srgb, ${tabColor} 10%, transparent)`,
                  borderColor: `color-mix(in srgb, ${tabColor} 30%, transparent)`,
                  color: tabColor,
                } : undefined}
              >
                {tab.label}
                <span
                  className="text-[10px] font-bold font-data px-1.5 py-0.5 rounded-md"
                  style={isActive
                    ? { backgroundColor: `color-mix(in srgb, ${tabColor} 15%, transparent)`, color: tabColor }
                    : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                  }
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 surface-elevated rounded-xl border border-theme p-0.5">
          {([
            { key: 'kanban' as const, icon: Columns3, label: 'Kanban' },
            { key: 'calendar' as const, icon: Calendar, label: 'Calendário' },
            { key: 'list' as const, icon: List, label: 'Lista' },
          ]).map(v => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              aria-label={`Visualização ${v.label}`}
              aria-pressed={viewMode === v.key}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === v.key
                  ? 'surface-card text-theme-primary shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              <v.icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* ──────── Kanban View ──────── */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-card-in">
          {(['draft', 'review', 'approved', 'published'] as ContentStatus[]).map(status => {
            const sCfg = statusConfig[status]
            const columnPosts = posts.filter(p => p.status === status)
            return (
              <div key={status} className="rounded-2xl border border-theme surface-card relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${sCfg.color}, transparent)` }} />

                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-theme">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sCfg.color }} />
                    <span className="text-sm font-bold text-theme-primary">{sCfg.label}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold font-data px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: sCfg.bg, color: sCfg.color }}
                  >
                    {columnPosts.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[200px]">
                  {columnPosts.map((post, i) => {
                    const tCfg = typeConfig[post.contentType]
                    const TypeIcon = tCfg.icon
                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className={`w-full text-left rounded-xl border border-theme p-3 transition-all cursor-pointer card-hover-lift animate-row-in row-stagger-${Math.min(i + 1, 8)}`}
                        style={{ '--glow-color': sCfg.color, backgroundColor: 'var(--bg-card-hover)' } as React.CSSProperties}
                      >
                        {/* Thumbnail */}
                        {post.thumbnailUrl ? (
                          <div className="relative group/thumb mb-2">
                            <img src={post.thumbnailUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
                            <div
                              className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                              onClick={e => { e.stopPropagation(); setImagePreview(post.thumbnailUrl) }}
                            >
                              <Eye size={20} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${sCfg.color} 5%, transparent)` }}>
                            <TypeIcon size={24} style={{ color: sCfg.color, opacity: 0.4 }} />
                          </div>
                        )}

                        <p className="text-sm font-semibold text-theme-primary leading-tight line-clamp-2 mb-1.5">
                          {post.title}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <PlatformIcon platform={post.platform} size={11} />
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sCfg.color }}>
                              {tCfg.label}
                            </span>
                          </div>
                          {post.scheduledDate && (
                            <span className="text-[10px] font-data text-theme-muted">
                              {new Date(post.scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md surface-elevated text-theme-muted">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}

                  {columnPosts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-theme-muted">
                      <FileText size={18} className="mb-1 opacity-30" />
                      <span className="text-[11px]">Nenhum post</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ──────── Calendar View ──────── */}
      {viewMode === 'calendar' && (
        <div className="hidden md:block rounded-2xl border border-theme surface-card animate-card-in relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-purple) 15%, transparent), transparent)' }} />

          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
            <button
              onClick={goToPrevMonth}
              aria-label="Mês anterior"
              className="p-2 rounded-xl surface-elevated border border-theme text-theme-muted hover:text-theme-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-base font-bold text-theme-primary tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToNextMonth}
              aria-label="Próximo mês"
              className="p-2 rounded-xl surface-elevated border border-theme text-theme-muted hover:text-theme-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-theme">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-[11px] font-semibold text-theme-muted py-2.5">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, idx) => {
              const dateKey = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
              const dayPosts = postsByDate.get(dateKey) || []
              const isToday = dateKey === todayStr

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] border-b border-r border-theme p-1.5 calendar-cell ${
                    cell.isCurrentMonth ? '' : 'opacity-40'
                  } ${isToday ? 'bg-[color-mix(in_srgb,var(--accent-cyan)_5%,transparent)]' : ''}`}
                >
                  {/* Day number */}
                  <span
                    className={`text-[11px] font-semibold font-data inline-block mb-1 ${
                      isToday ? 'px-1.5 py-0.5 rounded-md' : ''
                    }`}
                    style={isToday
                      ? { backgroundColor: 'var(--accent-cyan)', color: '#000' }
                      : { color: cell.isCurrentMonth ? 'var(--text-secondary)' : 'var(--text-ghost)' }
                    }
                  >
                    {cell.day}
                  </span>

                  {/* Post cards */}
                  <div className="flex flex-col gap-0.5">
                    {dayPosts.slice(0, 3).map(post => {
                      const sCfg = statusConfig[post.status]
                      return (
                        <button
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          aria-label={`Abrir: ${post.title}`}
                          className="w-full text-left rounded-md px-1.5 py-1 transition-colors cursor-pointer hover:brightness-125 group"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${sCfg.color} 8%, transparent)`,
                            borderLeft: `2px solid ${sCfg.color}`,
                          }}
                        >
                          <p className="text-[10px] font-semibold text-theme-primary leading-tight line-clamp-2">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <PlatformIcon platform={post.platform} size={9} />
                            <span
                              className="text-[8px] font-bold uppercase tracking-wider"
                              style={{ color: sCfg.color }}
                            >
                              {typeConfig[post.contentType].label}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                    {dayPosts.length > 3 && (
                      <span className="text-[9px] text-theme-muted font-data pl-1">
                        +{dayPosts.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ──────── Calendar: mobile fallback to list ──────── */}
      {viewMode === 'calendar' && (
        <div className="md:hidden">
          <ListView posts={filteredPosts} onSelect={setSelectedPost} />
        </div>
      )}

      {/* ──────── List View ──────── */}
      {(viewMode === 'list') && (
        <ListView posts={filteredPosts} onSelect={setSelectedPost} />
      )}

      {/* ──────── Empty state ──────── */}
      {filteredPosts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-theme-muted">
          <div className="w-12 h-12 rounded-2xl surface-elevated flex items-center justify-center mb-3 border border-theme">
            <FileText size={22} />
          </div>
          <p className="text-sm font-medium">Nenhum conteúdo encontrado</p>
          <p className="text-[11px] text-theme-muted mt-1">Ajuste os filtros ou crie um novo conteúdo</p>
        </div>
      )}

      {/* ──────── Image Preview Modal ──────── */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-backdrop cursor-pointer"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative animate-modal-in max-w-[90vmin] max-h-[90vmin]">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black transition-colors cursor-pointer"
              aria-label="Fechar preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ──────── Post Detail Modal ──────── */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onStatusChange={handleStatusChange}
          onImagePreview={setImagePreview}
        />
      )}
    </div>
  )
}

/* ──────────────────────────── List View Component ──────────────────────────── */

function ListView({
  posts,
  onSelect,
}: {
  posts: ContentPost[]
  onSelect: (post: ContentPost) => void
}) {
  return (
    <div className="rounded-2xl border border-theme surface-card animate-card-in relative overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-cyan) 15%, transparent), transparent)' }} />

      {/* Table header — hidden on mobile */}
      <div className="hidden lg:grid grid-cols-[40px_1fr_100px_100px_110px_120px_48px] gap-3 items-center px-5 py-3 border-b border-theme text-[10px] font-semibold text-theme-muted uppercase tracking-wider">
        <span />
        <span>Título</span>
        <span>Tipo</span>
        <span>Plataforma</span>
        <span>Data</span>
        <span>Status</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-[var(--border)]">
        {posts.map((post, i) => {
          const sCfg = statusConfig[post.status]
          const tCfg = typeConfig[post.contentType]
          const TypeIcon = tCfg.icon

          return (
            <button
              key={post.id}
              onClick={() => onSelect(post)}
              className="w-full text-left transition-colors cursor-pointer hover:bg-[var(--bg-card-hover)] animate-card-in"
              style={{ animationDelay: `${i * 0.03}s` }}
              aria-label={`Ver detalhes: ${post.title}`}
            >
              {/* Desktop row */}
              <div className="hidden lg:grid grid-cols-[40px_1fr_100px_100px_110px_120px_48px] gap-3 items-center px-5 py-3.5">
                {/* Type icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `color-mix(in srgb, ${sCfg.color} 10%, transparent)`, color: sCfg.color }}
                >
                  <TypeIcon size={15} />
                </div>

                {/* Title */}
                <span className="text-sm font-semibold text-theme-primary truncate">
                  {post.title}
                </span>

                {/* Type badge */}
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md text-center w-fit"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)', color: 'var(--accent-cyan)' }}
                >
                  {tCfg.label}
                </span>

                {/* Platform */}
                <div className="flex items-center gap-1.5 text-[11px] text-theme-secondary">
                  <PlatformIcon platform={post.platform} size={13} />
                  {platformConfig[post.platform].label}
                </div>

                {/* Date */}
                <span className="text-[11px] font-data text-theme-muted">
                  {formatScheduledDate(post.scheduledDate)}
                </span>

                {/* Status badge */}
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-md text-center w-fit"
                  style={{ backgroundColor: sCfg.bg, color: sCfg.color }}
                >
                  {sCfg.label}
                </span>

                {/* Action */}
                <div className="flex justify-center text-theme-muted">
                  <Eye size={15} />
                </div>
              </div>

              {/* Mobile row */}
              <div className="flex lg:hidden items-center gap-3 px-4 py-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${sCfg.color} 10%, transparent)`, color: sCfg.color }}
                >
                  <TypeIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-theme-primary truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-theme-muted font-data">
                      {formatScheduledDate(post.scheduledDate)}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: sCfg.bg, color: sCfg.color }}
                    >
                      {sCfg.label}
                    </span>
                  </div>
                </div>
                <Eye size={15} className="text-theme-muted flex-shrink-0" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
