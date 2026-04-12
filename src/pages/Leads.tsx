import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import {
  User, Phone, Tag, Calendar, GripVertical, ArrowRight,
  Loader2, Zap, Trophy, X, AlertCircle, StickyNote, DollarSign,
  UserCircle, Send, ChevronDown, ChevronUp, RefreshCw,
  MessageCircle, Instagram,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { useKanbanSync } from '@/hooks/useKanbanSync'
import { useClientId } from '@/hooks/useClientId'
import { useFunnelLabelConfig } from '@/hooks/useFunnelLabelConfig'
import { useSync } from '@/hooks/useSync'
import type { Lead, LeadStatus, KanbanNote } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// Paleta de cores fixa para colunas do Kanban — distribuída e harmônica
const COLUMN_PALETTE = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#ef4444', // red
]

// Colunas fallback para demo mode
const defaultColumns: { status: LeadStatus; title: string; color: string }[] = [
  { status: 'Novo Lead', title: 'Novo Lead', color: COLUMN_PALETTE[0] },
  { status: 'Qualificando', title: 'Qualificando', color: COLUMN_PALETTE[1] },
  { status: 'Orçamento Enviado', title: 'Orçamento Enviado', color: COLUMN_PALETTE[2] },
  { status: 'Negociando', title: 'Negociando', color: COLUMN_PALETTE[3] },
  { status: 'Venda Fechada', title: 'Venda Fechada', color: COLUMN_PALETTE[4] },
]

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  won: { bg: 'bg-[#00FF8818]', text: 'text-[#00FF88]', label: 'Ganho' },
  lost: { bg: 'bg-[#FF4D6A18]', text: 'text-[#FF4D6A]', label: 'Perdido' },
  open: { bg: 'bg-[#00D4FF18]', text: 'text-[#00D4FF]', label: 'Aberto' },
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#FF4D6A',
  high: '#FF8C00',
  medium: '#FFD600',
  low: '#00D4FF',
  none: '',
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

// Componente de modal de notas
function NotesModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { clientId } = useClientId()
  const [notes, setNotes] = useState<KanbanNote[]>(lead.kanban?.notes || [])
  const [newNote, setNewNote] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNotes = useCallback(async () => {
    if (!lead.kanbanItemId || !clientId || !SUPABASE_URL) return
    setLoading(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/kanban-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, kanbanItemId: lead.kanbanItemId, action: 'get_notes' }),
      })
      const data = await res.json()
      if (data.notes) {
        const parsed = Array.isArray(data.notes) ? data.notes :
          (data.notes.notes ? data.notes.notes : [])
        setNotes(parsed)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [lead.kanbanItemId, clientId])

  // Buscar notas ao abrir o modal
  useEffect(() => { fetchNotes() }, [fetchNotes])

  // Fechar com ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSend = async () => {
    if (!newNote.trim() || !lead.kanbanItemId || !clientId || !SUPABASE_URL) return
    setSending(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/kanban-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId, kanbanItemId: lead.kanbanItemId,
          action: 'create_note', text: newNote.trim(),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setNewNote('')
        fetchNotes()
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <div>
            <h3 className="text-sm font-semibold text-white">Notas - {lead.name}</h3>
            {!lead.kanbanItemId && (
              <p className="text-xs text-[#555] mt-1">Lead sem vínculo ao Kanban</p>
            )}
          </div>
          <button onClick={onClose} aria-label="Fechar notas" className="p-1 rounded-lg hover:bg-[#1a1a1a] text-[#888] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <div className="text-center text-xs text-[#555]">Carregando...</div>}
          {notes.length === 0 && !loading && (
            <div className="text-center py-8 text-[#444]">
              <StickyNote size={24} className="mx-auto mb-2" />
              <p className="text-xs">Nenhuma nota</p>
            </div>
          )}
          {notes.map((note, i) => (
            <div key={note.id || i} className="bg-[#111] rounded-xl border border-[#1a1a1a] p-3">
              <p className="text-sm text-[#ccc] whitespace-pre-wrap">{note.text}</p>
              {note.created_at && (
                <p className="text-[10px] text-[#555] mt-2">
                  {new Date(note.created_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Add note */}
        {lead.kanbanItemId && (
          <div className="p-4 border-t border-[#1a1a1a]">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escrever nota..."
                className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00D4FF] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newNote.trim()}
                className="px-3 py-2 rounded-xl bg-[#00D4FF] text-black text-sm font-medium disabled:opacity-40 hover:brightness-110 transition-all"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Leads() {
  const { leads, moveLeadStatus, loading } = useData()
  const { isDemo } = useAuth()
  const { funnelStages } = useTenant()
  const { syncMoveToStage, isConnected } = useKanbanSync()
  const { labelConfigs, isLoading: labelsLoading } = useFunnelLabelConfig()
  const { sync, syncing } = useSync()
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [notesLead, setNotesLead] = useState<Lead | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const dragCounter = useRef<Record<string, number>>({})

  const columns = useMemo(() => {
    if (isDemo || funnelStages.length === 0) return defaultColumns
    return funnelStages.map((stage, i) => ({
      status: stage.stage_name as LeadStatus,
      title: stage.stage_name,
      color: COLUMN_PALETTE[i % COLUMN_PALETTE.length],
    }))
  }, [isDemo, funnelStages])

  const statusOrder = useMemo(() => columns.map(c => c.status), [columns])

  const getLeadsByStatus = (status: LeadStatus) =>
    leads.filter((l) => l.status === status)

  const handleMove = async (lead: Lead, newStatus: LeadStatus) => {
    moveLeadStatus(lead.id, newStatus)
    if (lead.kanbanItemId) {
      await syncMoveToStage(lead.kanbanItemId, newStatus as string)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4'
  }
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLead(null); setDropTarget(null); dragCounter.current = {}
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1'
  }
  const handleDragEnter = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    dragCounter.current[status] = (dragCounter.current[status] || 0) + 1
    setDropTarget(status)
  }
  const handleDragLeave = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    dragCounter.current[status] = (dragCounter.current[status] || 0) - 1
    if (dragCounter.current[status] <= 0) { dragCounter.current[status] = 0; if (dropTarget === status) setDropTarget(null) }
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault(); setDropTarget(null); dragCounter.current = {}
    if (draggedLead && draggedLead.status !== newStatus) handleMove(draggedLead, newStatus)
    setDraggedLead(null)
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Leads" description="Kanban de gerenciamento de leads e funil de vendas" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando leads...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Kanban de gerenciamento de leads e funil de vendas"
        action={
          <button
            onClick={async () => { await sync(); window.location.reload() }}
            disabled={syncing}
            aria-label="Sincronizar leads com CRM"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#00D4FF10] text-[#00D4FF] border border-[#00D4FF25] hover:bg-[#00D4FF20] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        }
      />

      {isConnected && (
        <div className="flex items-center gap-2 mb-4 text-xs text-[#00FF88]">
          <Zap size={12} />
          <span>Sincronizado com Kanban</span>
        </div>
      )}

      {/* Etiquetas do funil */}
      {!labelsLoading && labelConfigs.filter(l => l.visible).length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Tag size={12} className="text-[#888]" />
          {labelConfigs.filter(l => l.visible).map(label => (
            <span
              key={label.id}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#A855F718] text-[#A855F7] border border-[#A855F730]"
            >
              {label.label_name}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col, colIdx) => {
          const colLeads = getLeadsByStatus(col.status)
          const isOver = dropTarget === col.status && draggedLead?.status !== col.status

          return (
            <div
              key={col.status}
              className={`min-w-[300px] flex-1 rounded-2xl border p-4 flex flex-col transition-all duration-200 animate-card-in ${
                isOver ? 'bg-[#0d0d0d] border-[#00D4FF40] shadow-[0_0_30px_rgba(0,212,255,0.08)]' : 'bg-[#0a0a0a] border-[#1a1a1a]'
              }`}
              style={{ animationDelay: `${colIdx * 0.06}s` }}
              onDragEnter={e => handleDragEnter(e, col.status)}
              onDragLeave={e => handleDragLeave(e, col.status)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.status)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1a1a1a] relative">
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-30" style={{ background: `linear-gradient(90deg, ${col.color}, transparent)` }} />
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}60` }} />
                <span className="text-sm font-bold text-white flex-1 tracking-tight">{col.title}</span>
                <span className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md" style={{ backgroundColor: col.color + '15', color: col.color }}>
                  {colLeads.length}
                </span>
              </div>

              {isOver && (
                <div className="border border-dashed border-[#00D4FF30] rounded-xl p-3 mb-3 text-center text-[11px] text-[#00D4FF50] bg-[#00D4FF05]">
                  Soltar aqui
                </div>
              )}

              {/* Cards */}
              <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto">
                {colLeads.map((lead) => {
                  const k = lead.kanban
                  const statusInfo = k ? STATUS_COLORS[k.status] || STATUS_COLORS.open : null
                  const priorityColor = k ? PRIORITY_COLORS[k.priority] : ''
                  const isExpanded = expandedCards.has(lead.id)

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={e => handleDragStart(e, lead)}
                      onDragEnd={handleDragEnd}
                      className="bg-[#0e0e0e] rounded-xl border border-[#1a1a1a] p-3 hover:border-[#2a2a2a] hover:bg-[#111] transition-all duration-200 group cursor-grab active:cursor-grabbing relative overflow-hidden"
                      style={priorityColor ? { borderLeftWidth: 3, borderLeftColor: priorityColor } : undefined}
                    >
                      {/* Header: name + status */}
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical size={14} className="text-[#333] flex-shrink-0 group-hover:text-[#666] transition-colors" />
                        <span className="text-[13px] font-bold text-white truncate flex-1">{lead.name}</span>
                        {statusInfo && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
                            {statusInfo.label}
                          </span>
                        )}
                      </div>

                      {/* Basic info */}
                      <div className="space-y-1.5 ml-[22px]">
                        <div className="flex items-center gap-2 text-[11px] text-[#666] font-data">
                          <Phone size={11} className="flex-shrink-0" />
                          <span>{lead.phone}</span>
                        </div>

                        {k && k.value > 0 && (
                          <div className="flex items-center gap-2 text-[11px] font-bold font-data" style={{ color: col.color }}>
                            <DollarSign size={11} className="flex-shrink-0" />
                            <span>{formatCurrency(k.value)}</span>
                          </div>
                        )}

                        {k && k.offers.length > 0 && (
                          <div className="flex items-center gap-2 text-[11px] text-[#666]">
                            <Tag size={11} className="flex-shrink-0" />
                            <span className="truncate">{k.offers.map(o => o.description).join(', ')}</span>
                          </div>
                        )}

                        {k && k.assigned_agents.length > 0 && (
                          <div className="flex items-center gap-2 text-[11px] text-[#666]">
                            <UserCircle size={11} className="flex-shrink-0" />
                            <span className="truncate">{k.assigned_agents.map(a => a.name).join(', ')}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-[#666]">
                          {lead.channel === 'instagram' ? (
                            <Instagram size={11} className="flex-shrink-0 text-[#E1306C]" />
                          ) : (
                            <MessageCircle size={11} className="flex-shrink-0 text-[#25D366]" />
                          )}
                          <span>{lead.channel === 'instagram' ? 'Instagram' : 'WhatsApp'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#555] font-data">
                          <Calendar size={11} className="flex-shrink-0" />
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                      </div>

                      {/* Expandable: notes preview */}
                      {k && k.notes.length > 0 && isExpanded && (
                        <div className="mt-2 ml-[22px] space-y-1">
                          {k.notes.slice(0, 3).map((note, i) => (
                            <div key={i} className="text-[10px] text-[#555] bg-[#080808] rounded-lg px-2 py-1 truncate border border-[#1a1a1a]">
                              {note.text}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#151515]">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setNotesLead(lead)}
                            aria-label={`Notas de ${lead.name}`}
                            className="p-1.5 rounded-lg bg-[#151515] hover:bg-[#1e1e1e] text-[#555] hover:text-[#FFD600] transition-colors relative cursor-pointer"
                          >
                            <StickyNote size={13} />
                            {k && k.notes.length > 0 && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FFD600] text-black text-[8px] font-bold flex items-center justify-center">
                                {k.notes.length}
                              </span>
                            )}
                          </button>
                          {k && (k.notes.length > 0 || k.offers.length > 0) && (
                            <button
                              onClick={() => toggleExpand(lead.id)}
                              aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                              className="p-1.5 rounded-lg bg-[#151515] hover:bg-[#1e1e1e] text-[#555] hover:text-white transition-colors cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {statusOrder.indexOf(col.status) > 0 && (
                            <button
                              onClick={() => handleMove(lead, statusOrder[statusOrder.indexOf(col.status) - 1])}
                              aria-label={`Mover ${lead.name} para etapa anterior`}
                              className="p-1.5 rounded-lg bg-[#151515] hover:bg-[#1e1e1e] text-[#555] hover:text-white transition-colors cursor-pointer"
                            >
                              <ArrowRight size={13} className="rotate-180" />
                            </button>
                          )}
                          {statusOrder.indexOf(col.status) < statusOrder.length - 1 && (
                            <button
                              onClick={() => handleMove(lead, statusOrder[statusOrder.indexOf(col.status) + 1])}
                              aria-label={`Mover ${lead.name} para próxima etapa`}
                              className="p-1.5 rounded-lg bg-[#151515] hover:bg-[#1e1e1e] text-[#555] hover:text-white transition-colors cursor-pointer"
                            >
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {colLeads.length === 0 && !isOver && (
                  <div className="flex flex-col items-center justify-center py-10 text-[#333]">
                    <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center mb-2 border border-[#1a1a1a]">
                      <User size={18} />
                    </div>
                    <span className="text-[11px] font-medium">Nenhum lead</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Notes Modal */}
      {notesLead && <NotesModal lead={notesLead} onClose={() => setNotesLead(null)} />}
    </div>
  )
}
