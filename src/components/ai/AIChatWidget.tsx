import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle, Minus, Send, Sparkles, User, X } from 'lucide-react'
import { useAIChat } from '@/hooks/useAIChat'
import { useAIConversations, type AIConversationMessage } from '@/hooks/useAIConversations'

const STORAGE_KEY = 'ai_chat_widget_open'

const SUGGESTIONS = [
  'Quantas conversas tive essa semana?',
  'Quais são meus principais gargalos?',
  'Qual a melhor oportunidade agora?',
]

export default function AIChatWidget() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === '1'
  })
  const [draft, setDraft] = useState('')
  const { sendMessage, loading, error } = useAIChat()
  const { data: conversation, isLoading: loadingHistory } = useAIConversations({ limit: 40 })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
    }
  }, [open])

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [open, conversation, loading])

  const handleSend = async (text?: string) => {
    const message = (text ?? draft).trim()
    if (!message || loading) return
    setDraft('')
    try {
      await sendMessage(message)
    } catch {
      // erro exposto via hook.error — mensagem do usuário ainda fica salva no banco
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple, #8b5cf6))',
          boxShadow: '0 10px 30px -10px color-mix(in srgb, var(--accent-cyan) 50%, transparent)',
        }}
        aria-label="Abrir chat com IA"
      >
        <MessageCircle size={22} className="text-white" />
      </button>
    )
  }

  const messages = conversation ?? []
  const hasHistory = messages.length > 0

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[min(400px,calc(100vw-3rem))] max-h-[80vh] flex flex-col rounded-2xl border border-theme surface-card shadow-2xl overflow-hidden">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-theme"
        style={{ background: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--accent-cyan) 20%, transparent)' }}
          >
            <Bot size={16} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-theme-primary leading-tight">Seu funcionário de IA</p>
            <p className="text-[10px] text-theme-tertiary">Conhece seus dados de atendimento</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-white/5 transition"
            aria-label="Minimizar"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-white/5 transition"
            aria-label="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
        {loadingHistory && (
          <div className="text-xs text-theme-muted text-center py-8">Carregando conversas...</div>
        )}

        {!loadingHistory && !hasHistory && (
          <div className="text-center py-6">
            <Sparkles size={24} className="mx-auto text-theme-muted mb-2" />
            <p className="text-sm text-theme-secondary font-medium">Pergunte o que quiser</p>
            <p className="text-xs text-theme-tertiary mt-1">Ele responde com base nos seus dados reais.</p>
            <div className="mt-4 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  disabled={loading}
                  className="text-xs text-left px-3 py-2 rounded-xl border border-theme surface-card hover:brightness-110 transition disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-theme-tertiary pl-10">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.3s' }} />
            </span>
            <span>pensando...</span>
          </div>
        )}

        {error && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex items-center gap-2 p-3 border-t border-theme"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Pergunte alguma coisa..."
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none px-2 py-1.5 rounded-lg border border-theme focus:border-[color:var(--accent-cyan)] transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          className="h-9 w-9 rounded-full flex items-center justify-center text-white transition disabled:opacity-40"
          style={{ background: 'var(--accent-cyan)' }}
          aria-label="Enviar"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: AIConversationMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
          style={{ background: 'color-mix(in srgb, var(--accent-cyan) 20%, transparent)' }}
        >
          <Bot size={14} style={{ color: 'var(--accent-cyan)' }} />
        </div>
      )}
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isUser ? 'text-white' : 'text-theme-primary'
        }`}
        style={
          isUser
            ? { background: 'var(--accent-cyan)' }
            : { background: 'color-mix(in srgb, var(--accent-cyan) 8%, var(--bg-card))' }
        }
      >
        {message.content}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center mt-0.5">
          <User size={14} className="text-theme-tertiary" />
        </div>
      )}
    </div>
  )
}
