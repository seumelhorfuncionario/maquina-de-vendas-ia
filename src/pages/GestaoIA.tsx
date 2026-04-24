import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Bot,
  ExternalLink,
  Instagram,
  LifeBuoy,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  Plus,
  RefreshCw,
  Send,
  X,
  Zap,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useClientAgents, type ClientAgent } from '../hooks/useClientAgents'
import { useClientTickets, type ClientTicket } from '../hooks/useClientTickets'

const SMF_BASE_URL =
  (import.meta.env.VITE_SMF_URL as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? 'https://painel.seumelhorfuncionario.com' : 'http://localhost:8080')

const ROLE_META: Record<'whatsapp' | 'instagram', { label: string; icon: typeof MessageCircle; color: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  instagram: { label: 'Instagram', icon: Instagram, color: '#E1306C' },
}

function RolePill({ role }: { role: 'whatsapp' | 'instagram' }) {
  const meta = ROLE_META[role]
  const Icon = meta.icon
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
      }}
    >
      <Icon size={10} />
      {meta.label}
    </span>
  )
}

function StatusPill({ active }: { active: boolean }) {
  const color = active ? 'var(--accent-green)' : 'var(--text-muted)'
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      {active ? 'Ativo' : 'Pausado'}
    </span>
  )
}

export default function GestaoIA() {
  const { data, loading, error, reload } = useClientAgents()
  const agents = data?.agents ?? []
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // Auto-select first agent once loaded
  const firstAgentId = agents[0]?.id ?? null
  const effectiveAgentId = selectedAgentId ?? firstAgentId
  const selectedAgent = agents.find((a) => a.id === effectiveAgentId) ?? null

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[90] bg-[var(--bg-base)] flex flex-col' : 'p-8 max-w-[1400px] mx-auto'}>
      {!fullscreen && (
        <PageHeader
          title="Gestão da IA"
          description="Refine o comportamento do seu agente e veja o histórico de ajustes"
          action={
            <button
              onClick={reload}
              className="p-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:surface-elevated transition-colors"
              aria-label="Recarregar"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          }
        />
      )}

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
              Não foi possível carregar seus agentes
            </div>
            <div className="text-xs text-theme-muted mt-1">{error}</div>
          </div>
        </div>
      )}

      {loading && !data ? (
        <div className="py-20 flex flex-col items-center justify-center text-theme-muted">
          <Loader2 size={28} className="animate-spin mb-3" style={{ color: 'var(--accent-cyan)' }} />
          <span className="text-sm">Carregando agentes...</span>
        </div>
      ) : agents.length === 0 ? (
        <EmptyState message={data?.message ?? 'Nenhum agente conectado ao seu painel ainda.'} />
      ) : (
        <>
          {/* Tabs de agentes */}
          {agents.length > 1 && !fullscreen && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {agents.map((agent) => (
                <AgentTab
                  key={agent.id}
                  agent={agent}
                  active={agent.id === effectiveAgentId}
                  onClick={() => setSelectedAgentId(agent.id)}
                />
              ))}
            </div>
          )}

          {selectedAgent && (
            <AgentWorkspace
              agent={selectedAgent}
              fullscreen={fullscreen}
              onToggleFullscreen={() => setFullscreen((f) => !f)}
            />
          )}
        </>
      )}
    </div>
  )
}

function AgentTab({
  agent,
  active,
  onClick,
}: {
  agent: ClientAgent
  active: boolean
  onClick: () => void
}) {
  const roles: ('whatsapp' | 'instagram')[] = []
  if (agent.roles.whatsapp) roles.push('whatsapp')
  if (agent.roles.instagram) roles.push('instagram')

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors text-left"
      style={{
        background: active ? 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)' : 'var(--bg-card)',
        borderColor: active ? 'var(--accent-cyan)' : 'var(--border)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: active ? 'color-mix(in srgb, var(--accent-cyan) 20%, transparent)' : 'var(--bg-elevated)',
          color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
        }}
      >
        <Bot size={14} />
      </div>
      <div className="min-w-0">
        <div
          className="text-sm font-semibold truncate"
          style={{ color: active ? 'var(--accent-cyan)' : 'var(--text-primary)' }}
        >
          {agent.nome_agente ?? 'Sem nome'}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {roles.map((r) => (
            <RolePill key={r} role={r} />
          ))}
          <StatusPill active={!!agent.em_uso} />
        </div>
      </div>
    </button>
  )
}

function AgentWorkspace({
  agent,
  fullscreen,
  onToggleFullscreen,
}: {
  agent: ClientAgent
  fullscreen: boolean
  onToggleFullscreen: () => void
}) {
  const [reloadKey, setReloadKey] = useState(0)
  const [ticketPanelOpen, setTicketPanelOpen] = useState(false)

  const refinarUrl = useMemo(() => {
    if (!agent.refinar_token) return null
    return `${SMF_BASE_URL}/refinar/${agent.refinar_token}`
  }, [agent.refinar_token])

  if (!refinarUrl) {
    return (
      <div
        className="p-6 rounded-xl border text-sm"
        style={{
          background: 'color-mix(in srgb, var(--accent-yellow) 8%, transparent)',
          borderColor: 'color-mix(in srgb, var(--accent-yellow) 30%, transparent)',
          color: 'var(--text-secondary)',
        }}
      >
        Este agente ainda não tem token de refinamento. Abra um ticket solicitando ativação.
      </div>
    )
  }

  return (
    <div className={fullscreen ? 'flex-1 flex flex-col' : 'flex flex-col rounded-2xl overflow-hidden border border-theme surface-card'} style={fullscreen ? undefined : { minHeight: 'calc(100vh - 250px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-theme" style={{ background: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span className="text-sm font-semibold text-theme-primary truncate">
            Painel de refinamento · {agent.nome_agente}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTicketPanelOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: ticketPanelOpen
                ? 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)'
                : 'transparent',
              color: ticketPanelOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: `1px solid ${ticketPanelOpen ? 'var(--accent-cyan)' : 'var(--border)'}`,
            }}
          >
            <LifeBuoy size={12} />
            Tickets
          </button>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="p-2 rounded hover:surface-card text-theme-muted hover:text-theme-primary"
            title="Recarregar"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded hover:surface-card text-theme-muted hover:text-theme-primary"
            title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <a
            href={refinarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded hover:surface-card text-theme-muted hover:text-theme-primary"
            title="Abrir em nova aba"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Split: iframe + tickets panel */}
      <div className={fullscreen ? 'flex-1 flex relative' : 'flex relative'} style={fullscreen ? undefined : { height: '75vh', minHeight: 560 }}>
        <div className="flex-1 relative" style={{ background: 'var(--bg-base)' }}>
          <iframe
            key={reloadKey}
            src={refinarUrl}
            title={`Refinar ${agent.nome_agente}`}
            className="absolute inset-0 w-full h-full border-0"
            allow="clipboard-read; clipboard-write"
          />
        </div>
        {ticketPanelOpen && (
          <TicketSidePanel agent={agent} onClose={() => setTicketPanelOpen(false)} />
        )}
      </div>
    </div>
  )
}

function TicketSidePanel({ agent, onClose }: { agent: ClientAgent; onClose: () => void }) {
  const { tickets, loading, error, reload, createTicket } = useClientTickets({ agentId: agent.id })
  const [showNew, setShowNew] = useState(false)

  return (
    <aside
      className="w-full md:w-[380px] shrink-0 flex flex-col border-l border-theme absolute md:relative inset-0 md:inset-auto z-10 md:z-0"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme">
        <div>
          <div className="text-sm font-bold text-theme-primary flex items-center gap-2">
            <LifeBuoy size={14} style={{ color: 'var(--accent-cyan)' }} />
            Tickets deste agente
          </div>
          <div className="text-[10px] text-theme-muted mt-0.5">
            Ajustes solicitados pra {agent.nome_agente}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:surface-elevated text-theme-muted">
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-2 border-b border-theme flex items-center gap-2">
        <button
          onClick={() => setShowNew(true)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', color: '#02131f' }}
        >
          <Plus size={12} />
          Novo ajuste
        </button>
        <button
          onClick={reload}
          className="p-2 rounded-lg border border-theme text-theme-muted hover:text-theme-primary"
          title="Recarregar"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {error ? (
          <div className="text-xs" style={{ color: 'var(--accent-red)' }}>{error}</div>
        ) : loading && tickets.length === 0 ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-theme-muted" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10 text-theme-muted text-xs">
            <Zap size={20} className="mx-auto mb-2 opacity-50" />
            Nenhum ajuste solicitado ainda pra este agente.
          </div>
        ) : (
          tickets.map((t) => <TicketItem key={t.id} ticket={t} />)
        )}
      </div>

      {showNew && (
        <NewAgentTicket
          agent={agent}
          onClose={() => setShowNew(false)}
          onCreate={async (payload) => {
            await createTicket({ ...payload, agent_id: agent.id, category: 'comportamento' })
            setShowNew(false)
          }}
        />
      )}
    </aside>
  )
}

function TicketItem({ ticket }: { ticket: ClientTicket }) {
  const statusColor =
    ticket.status === 'resolved' || ticket.status === 'closed'
      ? 'var(--accent-green)'
      : ticket.status === 'open'
      ? 'var(--accent-cyan)'
      : 'var(--accent-yellow)'

  return (
    <div
      className="p-3 rounded-lg border"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-theme-muted">
          #{ticket.ticket_number ?? ticket.id.slice(0, 8)}
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{
            color: statusColor,
            background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
          }}
        >
          {ticket.status}
        </span>
      </div>
      <div className="text-xs font-semibold text-theme-primary mb-1 line-clamp-2">
        {ticket.subject ?? '(sem assunto)'}
      </div>
      {ticket.description && (
        <div className="text-[11px] text-theme-muted line-clamp-2">{ticket.description}</div>
      )}
      <div className="text-[9px] text-theme-muted mt-1">
        {new Date(ticket.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  )
}

function NewAgentTicket({
  agent,
  onClose,
  onCreate,
}: {
  agent: ClientAgent
  onClose: () => void
  onCreate: (p: { subject: string; description: string; priority: string }) => Promise<void>
}) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    if (!subject.trim() || !description.trim()) {
      setErr('Preencha o assunto e a descrição do ajuste')
      return
    }
    setErr(null)
    setSubmitting(true)
    try {
      await onCreate({ subject: subject.trim(), description: description.trim(), priority })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao criar ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl surface-card border border-theme p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-theme-primary">Pedir ajuste no agente</h2>
            <p className="text-xs text-theme-muted mt-0.5">Ajuste para {agent.nome_agente}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:surface-elevated text-theme-muted">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-theme-muted mb-1 block">
              Assunto
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: A IA está respondendo sobre X quando deveria..."
              className="w-full px-3 py-2 rounded-lg surface-elevated border border-theme text-sm text-theme-primary outline-none focus:border-[var(--accent-cyan)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-theme-muted mb-1 block">
              Descrição do ajuste
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Descreva em detalhes: o que a IA está fazendo hoje, o que precisa fazer, e em que situação..."
              className="w-full px-3 py-2 rounded-lg surface-elevated border border-theme text-sm text-theme-primary outline-none focus:border-[var(--accent-cyan)] resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-theme-muted mb-1 block">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg surface-elevated border border-theme text-sm text-theme-primary"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
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

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-theme-secondary hover:text-theme-primary"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', color: '#02131f' }}
          >
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {submitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{
          background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
          color: 'var(--accent-cyan)',
        }}
      >
        <Bot size={24} />
      </div>
      <h3 className="text-base font-semibold text-theme-primary mb-1">Nenhum agente conectado</h3>
      <p className="text-sm text-theme-muted max-w-sm mx-auto">{message}</p>
    </div>
  )
}
