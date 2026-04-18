import { useMemo, useState } from 'react'
import { AlertCircle, Clock, Loader2, MessageSquare, Plus, RefreshCw, Send, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import {
  useClientTickets,
  useTicketDetail,
  type ClientTicket,
} from '../hooks/useClientTickets'

type StatusKey = 'open' | 'in_analysis' | 'in_development' | 'waiting_team' | 'waiting_client' | 'resolved' | 'closed' | string

const STATUS_META: Record<string, { label: string; color: string }> = {
  open: { label: 'Aberto', color: 'var(--accent-cyan)' },
  in_analysis: { label: 'Em análise', color: 'var(--accent-yellow)' },
  in_development: { label: 'Em desenvolvimento', color: 'var(--accent-purple)' },
  waiting_team: { label: 'Aguardando time', color: 'var(--accent-purple)' },
  waiting_client: { label: 'Aguardando você', color: 'var(--accent-yellow)' },
  resolved: { label: 'Resolvido', color: 'var(--accent-green)' },
  closed: { label: 'Fechado', color: 'var(--text-muted)' },
}

const IN_PROGRESS_STATUSES = new Set(['in_analysis', 'in_development', 'waiting_team', 'waiting_client'])

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'var(--text-muted)' },
  medium: { label: 'Média', color: 'var(--accent-cyan)' },
  high: { label: 'Alta', color: 'var(--accent-yellow)' },
  urgent: { label: 'Urgente', color: 'var(--accent-red)' },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusPill(status: string | null) {
  const meta = STATUS_META[status ?? ''] ?? { label: status ?? '—', color: 'var(--text-muted)' }
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
      }}
    >
      {meta.label}
    </span>
  )
}

function priorityPill(priority: string | null) {
  const meta = PRIORITY_META[priority ?? ''] ?? { label: priority ?? '—', color: 'var(--text-muted)' }
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
      style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}
    >
      {meta.label}
    </span>
  )
}

export default function MeusTickets() {
  const { tickets, loading, error, reload, createTicket } = useClientTickets()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState<'all' | StatusKey>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return tickets
    if (filter === 'in_progress') {
      return tickets.filter((t) => t.status != null && IN_PROGRESS_STATUSES.has(t.status))
    }
    return tickets.filter((t) => t.status === filter)
  }, [tickets, filter])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets.length, open: 0, in_progress: 0, resolved: 0, closed: 0 }
    tickets.forEach((t) => {
      const k = t.status ?? ''
      if (IN_PROGRESS_STATUSES.has(k)) {
        c.in_progress = (c.in_progress ?? 0) + 1
      } else {
        c[k] = (c[k] ?? 0) + 1
      }
    })
    return c
  }, [tickets])

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Meus Tickets"
        description="Abra chamados de suporte e acompanhe o andamento"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={reload}
              className="p-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:surface-elevated transition-colors"
              aria-label="Recarregar"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                color: '#02131f',
              }}
            >
              <Plus size={14} />
              Novo Ticket
            </button>
          </div>
        }
      />

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { k: 'all', label: 'Todos' },
          { k: 'open', label: 'Abertos' },
          { k: 'in_progress', label: 'Em andamento' },
          { k: 'resolved', label: 'Resolvidos' },
          { k: 'closed', label: 'Fechados' },
        ].map((f) => {
          const active = filter === f.k
          return (
            <button
              key={f.k}
              onClick={() => setFilter(f.k as 'all' | StatusKey)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderColor: active ? 'var(--accent-cyan)' : 'var(--border)',
                background: active ? 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)' : 'transparent',
              }}
            >
              {f.label}
              <span className="ml-2 opacity-60">{counts[f.k] ?? 0}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6"
          style={{
            background: 'color-mix(in srgb, var(--accent-red) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-red) 25%, transparent)',
          }}
        >
          <AlertCircle size={18} style={{ color: 'var(--accent-red)' }} className="shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--accent-red)' }}>
              Não foi possível carregar seus tickets
            </div>
            <div className="text-xs text-theme-muted mt-1">{error}</div>
          </div>
        </div>
      )}

      {loading && tickets.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-theme-muted">
          <Loader2 size={28} className="animate-spin mb-3" style={{ color: 'var(--accent-cyan)' }} />
          <span className="text-sm">Carregando tickets...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onNew={() => setShowNew(true)} hasAny={tickets.length > 0} />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <TicketRow key={t.id} ticket={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}

      {showNew && (
        <NewTicketDialog
          onClose={() => setShowNew(false)}
          onCreate={async (payload) => {
            await createTicket(payload)
            setShowNew(false)
          }}
        />
      )}

      {selectedId && <TicketDetail ticketId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}

function TicketRow({ ticket, onClick }: { ticket: ClientTicket; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl surface-card border border-theme hover:border-[var(--accent-cyan)]/40 transition-colors group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-theme-muted">#{ticket.ticket_number ?? ticket.id.slice(0, 8)}</span>
            {statusPill(ticket.status)}
            {priorityPill(ticket.priority)}
          </div>
          <h3 className="text-sm font-semibold text-theme-primary truncate group-hover:text-[var(--accent-cyan)] transition-colors">
            {ticket.subject ?? '(sem assunto)'}
          </h3>
          {ticket.description && (
            <p className="text-xs text-theme-tertiary line-clamp-2 mt-1">{ticket.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="flex items-center gap-1 text-[10px] text-theme-muted">
            <Clock size={10} />
            {formatDate(ticket.created_at)}
          </span>
          {ticket.category && <span className="text-[10px] text-theme-muted">{ticket.category}</span>}
        </div>
      </div>
    </button>
  )
}

function EmptyState({ onNew, hasAny }: { onNew: () => void; hasAny: boolean }) {
  return (
    <div className="text-center py-20">
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{
          background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
          color: 'var(--accent-cyan)',
        }}
      >
        <MessageSquare size={24} />
      </div>
      <h3 className="text-base font-semibold text-theme-primary mb-1">
        {hasAny ? 'Nenhum ticket com esse filtro' : 'Nenhum ticket por aqui ainda'}
      </h3>
      <p className="text-sm text-theme-muted mb-6 max-w-sm mx-auto">
        {hasAny
          ? 'Troque o filtro ou abra um novo chamado.'
          : 'Abra seu primeiro chamado e nosso time entra em contato.'}
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', color: '#02131f' }}
      >
        <Plus size={14} />
        Abrir ticket
      </button>
    </div>
  )
}

function NewTicketDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (p: { subject: string; description: string; priority: string; category: string }) => Promise<void>
}) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    if (!subject.trim() || !description.trim()) {
      setErr('Preencha assunto e descrição')
      return
    }
    setErr(null)
    setSubmitting(true)
    try {
      await onCreate({ subject: subject.trim(), description: description.trim(), priority, category })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao criar ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-theme surface-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-theme-primary">Novo ticket</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:surface-elevated text-theme-muted">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-theme-muted mb-1 block">
              Assunto
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Em uma frase, o que precisa?"
              className="w-full px-3 py-2.5 rounded-lg surface-elevated border border-theme text-sm text-theme-primary outline-none focus:border-[var(--accent-cyan)]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-theme-muted mb-1 block">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conte com detalhes: o que aconteceu, quando, como reproduzir..."
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg surface-elevated border border-theme text-sm text-theme-primary outline-none focus:border-[var(--accent-cyan)] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-theme-muted mb-1 block">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg surface-elevated border border-theme text-sm text-theme-primary outline-none focus:border-[var(--accent-cyan)]"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-theme-muted mb-1 block">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg surface-elevated border border-theme text-sm text-theme-primary outline-none focus:border-[var(--accent-cyan)]"
              >
                <option value="general">Geral</option>
                <option value="bugs">Bug / Erro</option>
                <option value="comportamento">Ajustar comportamento da IA</option>
                <option value="base_conhecimento">Base de conhecimento</option>
                <option value="integracoes">Integração</option>
                <option value="automacoes">Automações</option>
                <option value="funcoes">Funções / Novas features</option>
                <option value="melhorias">Melhorias</option>
                <option value="treinamento">Treinamento</option>
                <option value="documentar">Documentar algo</option>
                <option value="conexoes">Conexões</option>
                <option value="billing">Financeiro / Billing</option>
              </select>
            </div>
          </div>

          {err && (
            <div
              className="text-xs p-2 rounded"
              style={{
                color: 'var(--accent-red)',
                background: 'color-mix(in srgb, var(--accent-red) 10%, transparent)',
              }}
            >
              {err}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-theme-secondary hover:text-theme-primary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', color: '#02131f' }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Enviando...' : 'Abrir ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TicketDetail({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { ticket, comments, loading, error, addComment } = useTicketDetail(ticketId)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    const content = draft.trim()
    if (!content) return
    setSending(true)
    try {
      await addComment(content)
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-end"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-full surface-card border-l border-theme flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-theme">
          <div className="min-w-0 flex-1">
            {ticket && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono text-theme-muted">
                    #{ticket.ticket_number ?? ticket.id.slice(0, 8)}
                  </span>
                  {statusPill(ticket.status)}
                  {priorityPill(ticket.priority)}
                </div>
                <h2 className="text-lg font-bold text-theme-primary">
                  {ticket.subject ?? '(sem assunto)'}
                </h2>
                <p className="text-xs text-theme-muted mt-1">
                  Aberto em {formatDate(ticket.created_at)}
                  {ticket.category && ` · ${ticket.category}`}
                </p>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded hover:surface-elevated text-theme-muted">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && !ticket ? (
            <div className="py-20 flex items-center justify-center text-theme-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="text-sm" style={{ color: 'var(--accent-red)' }}>{error}</div>
          ) : ticket ? (
            <>
              {/* Initial description */}
              <div className="surface-elevated border border-theme rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-wide text-theme-muted mb-1.5 font-semibold">
                  Descrição inicial
                </div>
                <p className="text-sm text-theme-primary whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.solution && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'color-mix(in srgb, var(--accent-green) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)',
                  }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wide mb-1.5 font-semibold"
                    style={{ color: 'var(--accent-green)' }}
                  >
                    Solução
                  </div>
                  <p className="text-sm text-theme-primary whitespace-pre-wrap">{ticket.solution}</p>
                </div>
              )}

              {/* Comments */}
              {comments.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] uppercase tracking-wide text-theme-muted font-semibold">
                    Conversa ({comments.length})
                  </div>
                  {comments.map((c) => {
                    const isClient = c.author_type === 'client'
                    return (
                      <div
                        key={c.id}
                        className={`rounded-xl p-4 ${isClient ? 'ml-6' : 'mr-6'}`}
                        style={{
                          background: isClient
                            ? 'color-mix(in srgb, var(--accent-cyan) 6%, var(--bg-card))'
                            : 'var(--bg-elevated)',
                          border: `1px solid ${
                            isClient
                              ? 'color-mix(in srgb, var(--accent-cyan) 20%, transparent)'
                              : 'var(--border)'
                          }`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-theme-primary">{c.author_name}</span>
                          <span className="text-[10px] text-theme-muted">{formatDate(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-theme-secondary whitespace-pre-wrap">{c.content}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Reply box */}
        {ticket && ticket.status !== 'closed' && (
          <div className="p-4 border-t border-theme">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Responda ou adicione informações..."
                rows={2}
                className="flex-1 px-3 py-2 rounded-lg surface-elevated border border-theme text-sm text-theme-primary outline-none focus:border-[var(--accent-cyan)] resize-none"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send()
                }}
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="p-2.5 rounded-lg disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                  color: '#02131f',
                }}
                aria-label="Enviar"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="text-[10px] text-theme-muted mt-1.5">⌘/Ctrl + Enter para enviar</div>
          </div>
        )}
      </div>
    </div>
  )
}
