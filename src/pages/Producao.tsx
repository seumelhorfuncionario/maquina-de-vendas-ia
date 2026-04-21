import { useMemo, useState, useEffect, useCallback } from 'react'
import { Package, User, ArrowRight, ArrowLeft, Hash, Calendar, Loader2, Clock, Cog, CheckCircle2, Truck, Phone, StickyNote, X, Send } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useData } from '../contexts/DataContext'
import { useClientId } from '../hooks/useClientId'
import type { ProductionOrder, ProductionStatus } from '../types'
import type { KanbanNote } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function NotesModal({ order, onClose }: { order: ProductionOrder; onClose: () => void }) {
  const { clientId } = useClientId()
  const [notes, setNotes] = useState<KanbanNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNotes = useCallback(async () => {
    if (!order.kanbanItemId || !clientId || !SUPABASE_URL) return
    setLoading(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/kanban-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, kanbanItemId: order.kanbanItemId, action: 'get_notes' }),
      })
      const data = await res.json()
      if (data.notes) {
        const parsed = Array.isArray(data.notes) ? data.notes :
          (data.notes.notes ? data.notes.notes : [])
        setNotes(parsed)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [order.kanbanItemId, clientId])

  useEffect(() => { fetchNotes() }, [fetchNotes])
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSend = async () => {
    if (!newNote.trim() || !order.kanbanItemId || !clientId || !SUPABASE_URL) return
    setSending(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/kanban-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId, kanbanItemId: order.kanbanItemId,
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
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <div>
            <h3 className="text-sm font-semibold text-white">Notas - {order.clientName}</h3>
            {!order.kanbanItemId && (
              <p className="text-xs text-[#555] mt-1">Pedido sem vínculo ao Kanban</p>
            )}
          </div>
          <button onClick={onClose} aria-label="Fechar notas" className="p-1 rounded-lg hover:bg-[#1a1a1a] text-[#888] cursor-pointer">
            <X size={18} />
          </button>
        </div>

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

        {order.kanbanItemId && (
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

const columns: { status: ProductionStatus; title: string; color: string }[] = [
  { status: 'pending', title: 'Novos Pedidos', color: '#00D4FF' },
  { status: 'producing', title: 'Em Produção', color: '#FFD600' },
  { status: 'done', title: 'Finalizados', color: '#A855F7' },
  { status: 'delivered', title: 'Entregues', color: '#00FF88' },
]

const statusOrder: ProductionStatus[] = ['pending', 'producing', 'done', 'delivered']

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_METRICS: { status: ProductionStatus; label: string; icon: typeof Clock; color: 'neutral' | 'warning' | 'purple' | 'positive' }[] = [
  { status: 'pending', label: 'Novos Pedidos', icon: Clock, color: 'neutral' },
  { status: 'producing', label: 'Em Produção', icon: Cog, color: 'warning' },
  { status: 'done', label: 'Finalizados', icon: CheckCircle2, color: 'purple' },
  { status: 'delivered', label: 'Entregues', icon: Truck, color: 'positive' },
]

export default function Producao() {
  const { production, moveProductionStatus, loading } = useData()
  const [notesOrder, setNotesOrder] = useState<ProductionOrder | null>(null)

  const metrics = useMemo(() => {
    const counts: Record<ProductionStatus, number> = { pending: 0, producing: 0, done: 0, delivered: 0 }
    let totalQty = 0
    for (const p of production) {
      counts[p.status] = (counts[p.status] || 0) + 1
      totalQty += p.quantity
    }
    return { counts, total: production.length, totalQty }
  }, [production])

  const handleMove = (id: string, currentStatus: ProductionStatus, direction: 'left' | 'right') => {
    const currentIndex = statusOrder.indexOf(currentStatus)
    const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0 || nextIndex >= statusOrder.length) return
    moveProductionStatus(id, statusOrder[nextIndex])
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Produção" description="Acompanhe o status dos pedidos em produção" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando pedidos...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Produção"
        description="Acompanhe o status dos pedidos em produção"
      />

      {/* Status metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STATUS_METRICS.map((m, i) => (
          <StatCard
            key={m.status}
            title={m.label}
            value={metrics.counts[m.status]}
            icon={<m.icon size={18} />}
            color={m.color}
            stagger={i + 1}
            subtitle={m.status === 'pending' && metrics.total > 0 ? `${metrics.total} pedidos · ${metrics.totalQty} unidades` : undefined}
          />
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const items = production.filter((p) => p.status === col.status)
          const colIndex = statusOrder.indexOf(col.status)

          return (
            <div
              key={col.status}
              className="min-w-[300px] flex-1 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <h2 className="text-sm font-semibold text-white">{col.title}</h2>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: col.color + '20', color: col.color }}
                >
                  {items.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#111] rounded-xl border border-[#1a1a1a] p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-[#888]" />
                      <span className="text-sm font-medium text-white">{order.clientName}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <Package size={14} className="text-[#888]" />
                      <span className="text-xs text-[#aaa]">{order.product}</span>
                    </div>

                    {order.phone && (
                      <div className="flex items-center gap-2 mb-1">
                        <Phone size={14} className="text-[#888]" />
                        <a
                          href={`https://wa.me/55${order.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#aaa] hover:text-[#25D366] transition-colors"
                        >
                          {order.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-1">
                      <Hash size={14} className="text-[#888]" />
                      <span className="text-xs text-[#aaa]">Qtd: {order.quantity}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={14} className="text-[#888]" />
                      <span className="text-xs text-[#aaa]">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleMove(order.id, order.status, 'left')}
                        disabled={colIndex === 0}
                        aria-label={`Mover ${order.clientName} para etapa anterior`}
                        className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#222] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        onClick={() => setNotesOrder(order)}
                        aria-label={`Notas de ${order.clientName}`}
                        className="p-1.5 rounded-lg bg-[#151515] hover:bg-[#1e1e1e] text-[#555] hover:text-[#FFD600] transition-colors cursor-pointer"
                      >
                        <StickyNote size={13} />
                      </button>
                      <button
                        onClick={() => handleMove(order.id, order.status, 'right')}
                        disabled={colIndex === statusOrder.length - 1}
                        aria-label={`Mover ${order.clientName} para próxima etapa`}
                        className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#222] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-xs text-[#555] text-center py-6">Nenhum pedido</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {notesOrder && <NotesModal order={notesOrder} onClose={() => setNotesOrder(null)} />}
    </div>
  )
}
