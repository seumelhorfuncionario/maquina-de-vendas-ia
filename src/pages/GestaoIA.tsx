import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Bot,
  Check,
  Clock,
  Copy,
  Eye,
  Instagram,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Power,
  RefreshCw,
  Settings2,
  Tag,
  Thermometer,
  Volume2,
  X,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAgentDetail, useClientAgents, type ClientAgent } from '../hooks/useClientAgents'

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
  const label = active ? 'Ativo' : 'Pausado'
  const color = active ? 'var(--accent-green)' : 'var(--text-muted)'
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      <Power size={10} />
      {label}
    </span>
  )
}

function formatHour(h: number | null | undefined) {
  if (h == null) return '—'
  return `${String(h).padStart(2, '0')}:00`
}

export default function GestaoIA() {
  const navigate = useNavigate()
  const { data, loading, error, reload } = useClientAgents()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const agents = data?.agents ?? []

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Gestão da IA"
        description="Visualize e configure seus agentes de IA"
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
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onOpen={() => setSelectedId(agent.id)} />
          ))}
        </div>
      )}

      {/* Info strip */}
      <div
        className="mt-8 flex items-start gap-3 rounded-xl p-4"
        style={{
          background: 'color-mix(in srgb, var(--accent-cyan) 6%, var(--bg-card))',
          border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
        }}
      >
        <LifeBuoy size={18} style={{ color: 'var(--accent-cyan)' }} className="shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <div className="font-semibold text-theme-primary mb-0.5">Precisa de ajuste?</div>
          <div className="text-theme-muted">
            Edições de prompt e comportamento são feitas pelo nosso time. Abra um chamado em{' '}
            <Link to="/meus-tickets" className="underline" style={{ color: 'var(--accent-cyan)' }}>
              Meus Tickets
            </Link>{' '}
            descrevendo o que precisa mudar.
          </div>
        </div>
        <button
          onClick={() => navigate('/meus-tickets')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
          style={{ background: 'var(--accent-cyan)', color: '#02131f' }}
        >
          Abrir ticket
        </button>
      </div>

      {selectedId && (
        <AgentDrawer agentId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}

function AgentCard({ agent, onOpen }: { agent: ClientAgent; onOpen: () => void }) {
  const roles: ('whatsapp' | 'instagram')[] = []
  if (agent.roles.whatsapp) roles.push('whatsapp')
  if (agent.roles.instagram) roles.push('instagram')

  return (
    <button
      onClick={onOpen}
      className="text-left p-5 rounded-2xl surface-card border border-theme hover:border-[var(--accent-cyan)]/40 transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
            color: 'var(--accent-cyan)',
          }}
        >
          <Bot size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-theme-primary truncate group-hover:text-[var(--accent-cyan)] transition-colors">
              {agent.nome_agente ?? 'Sem nome'}
            </h3>
            <StatusPill active={!!agent.em_uso} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {roles.map((r) => (
              <RolePill key={r} role={r} />
            ))}
            {agent.versao && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
              >
                {agent.versao}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <MetaItem icon={Zap} label="Modelo" value={agent.modelo_llm ?? '—'} />
        <MetaItem icon={Thermometer} label="Temperatura" value={agent.temperatura?.toFixed(1) ?? '—'} />
        <MetaItem icon={Clock} label="Debounce" value={agent.debounce_segundos != null ? `${agent.debounce_segundos}s` : '—'} />
        <MetaItem icon={Volume2} label="TTS" value={agent.tts_habilitado ? 'Ativado' : 'Desativado'} />
      </div>

      {agent.horario_funcionamento_habilitado && (
        <div className="mt-3 text-[11px] text-theme-muted">
          <Clock size={10} className="inline mr-1" />
          Horário: {formatHour(agent.horario_funcionamento_inicio)} – {formatHour(agent.horario_funcionamento_fim)}
        </div>
      )}
    </button>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: typeof Bot; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon size={12} className="shrink-0 text-theme-muted" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-theme-muted">{label}</div>
        <div className="text-theme-primary font-medium truncate">{value}</div>
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

function AgentDrawer({ agentId, onClose }: { agentId: number; onClose: () => void }) {
  const { agent, refinements, loading, error } = useAgentDetail(agentId)
  const [promptCopied, setPromptCopied] = useState(false)

  const copyPrompt = () => {
    if (!agent?.prompt_agente) return
    navigator.clipboard.writeText(agent.prompt_agente)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 2000)
  }

  const promptPreview = useMemo(() => {
    if (!agent?.prompt_agente) return null
    return agent.prompt_agente.length > 2000
      ? agent.prompt_agente.slice(0, 2000) + '\n\n[...]'
      : agent.prompt_agente
  }, [agent?.prompt_agente])

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
        <div className="flex items-start justify-between p-6 border-b border-theme">
          <div className="min-w-0 flex-1">
            {agent ? (
              <>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-lg font-bold text-theme-primary">{agent.nome_agente}</h2>
                  <StatusPill active={!!agent.em_uso} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {agent.roles.whatsapp && <RolePill role="whatsapp" />}
                  {agent.roles.instagram && <RolePill role="instagram" />}
                </div>
                <p className="text-xs text-theme-muted">
                  {agent.nome_cliente ?? '—'} · id {agent.id}
                </p>
              </>
            ) : (
              <h2 className="text-lg font-bold text-theme-primary">Carregando agente...</h2>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded hover:surface-elevated text-theme-muted">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading && !agent ? (
            <div className="py-20 flex items-center justify-center text-theme-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="text-sm" style={{ color: 'var(--accent-red)' }}>{error}</div>
          ) : agent ? (
            <>
              <ConfigSection title="Parâmetros do modelo" icon={Settings2}>
                <ConfigGrid
                  items={[
                    { label: 'Modelo LLM', value: agent.modelo_llm ?? '—' },
                    { label: 'Temperatura', value: agent.temperatura?.toFixed(2) ?? '—' },
                    { label: 'Top P', value: agent.top_p?.toFixed(2) ?? '—' },
                    { label: 'Debounce', value: agent.debounce_segundos != null ? `${agent.debounce_segundos}s` : '—' },
                  ]}
                />
              </ConfigSection>

              <ConfigSection title="Canais e integrações" icon={MessageCircle}>
                <ConfigGrid
                  items={[
                    { label: 'Canal principal', value: agent.canal ?? '—' },
                    { label: 'Telefone', value: agent.telefone_instancia ?? '—' },
                    { label: 'Instagram', value: agent.instagram_username ?? '—' },
                    { label: 'RAG', value: agent.rag_habilitado ? 'Ativo' : 'Desativado' },
                  ]}
                />
              </ConfigSection>

              {agent.horario_funcionamento_habilitado && (
                <ConfigSection title="Horário de funcionamento" icon={Clock}>
                  <div className="text-sm text-theme-primary">
                    Ativo das <strong>{formatHour(agent.horario_funcionamento_inicio)}</strong> às{' '}
                    <strong>{formatHour(agent.horario_funcionamento_fim)}</strong>
                  </div>
                  {agent.mensagem_fora_horario && (
                    <div className="mt-2 text-xs text-theme-muted whitespace-pre-wrap">
                      <span className="uppercase tracking-wide font-semibold block mb-1">
                        Mensagem fora do horário
                      </span>
                      {agent.mensagem_fora_horario}
                    </div>
                  )}
                </ConfigSection>
              )}

              {agent.tags && agent.tags.length > 0 && (
                <ConfigSection title="Tags" icon={Tag}>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded"
                        style={{
                          color: 'var(--accent-purple)',
                          background: 'color-mix(in srgb, var(--accent-purple) 12%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--accent-purple) 30%, transparent)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </ConfigSection>
              )}

              {promptPreview && (
                <ConfigSection
                  title="Prompt do agente"
                  icon={Eye}
                  action={
                    <button
                      onClick={copyPrompt}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded border border-theme text-theme-secondary hover:text-theme-primary"
                    >
                      {promptCopied ? <Check size={12} /> : <Copy size={12} />}
                      {promptCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  }
                >
                  <pre
                    className="text-[11px] leading-relaxed whitespace-pre-wrap break-words p-3 rounded-lg max-h-[320px] overflow-y-auto"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {promptPreview}
                  </pre>
                </ConfigSection>
              )}

              {refinements.length > 0 && (
                <ConfigSection title={`Refinamentos (${refinements.length})`} icon={Zap}>
                  <div className="space-y-2">
                    {refinements.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-lg border border-theme"
                        style={{ background: 'var(--bg-elevated)' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wide text-theme-muted font-semibold">
                            {r.tipo_gatilho ?? 'refinamento'}
                          </span>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              color: r.ativo ? 'var(--accent-green)' : 'var(--text-muted)',
                              background: `color-mix(in srgb, ${r.ativo ? 'var(--accent-green)' : 'var(--text-muted)'} 12%, transparent)`,
                            }}
                          >
                            {r.ativo ? 'ativo' : 'inativo'}
                          </span>
                        </div>
                        {r.descricao_intencao && (
                          <p className="text-xs text-theme-primary font-medium mb-1">{r.descricao_intencao}</p>
                        )}
                        {r.instrucao_adicional && (
                          <p className="text-xs text-theme-muted whitespace-pre-wrap">{r.instrucao_adicional}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ConfigSection>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ConfigSection({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string
  icon: typeof Bot
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={12} className="text-theme-muted" />
          <h4 className="text-[11px] uppercase tracking-wide font-semibold text-theme-muted">{title}</h4>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </section>
  )
}

function ConfigGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="p-3 rounded-lg border border-theme"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div className="text-[10px] uppercase tracking-wide text-theme-muted font-semibold">{it.label}</div>
          <div className="text-sm text-theme-primary font-medium truncate">{it.value}</div>
        </div>
      ))}
    </div>
  )
}
