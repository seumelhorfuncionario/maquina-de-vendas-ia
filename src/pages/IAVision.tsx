import { useState, useEffect } from 'react'
import { Bot, User, Zap, CheckCircle, MessageCircle, ShoppingCart, FileText, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { mockAIConversation } from '../data/mock'

export default function IAVision() {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount < mockAIConversation.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [visibleCount])

  const allMessagesShown = visibleCount >= mockAIConversation.length

  const statusCards = [
    {
      label: 'IA Ativa',
      value: 'Respondendo 24/7',
      icon: Zap,
      pulse: true,
    },
    {
      label: 'Conversas Hoje',
      value: '23 atendimentos',
      icon: MessageCircle,
      pulse: false,
    },
    {
      label: 'Orçamentos Gerados',
      value: '12 orçamentos',
      icon: FileText,
      pulse: false,
    },
    {
      label: 'Vendas Fechadas pela IA',
      value: '8 vendas',
      icon: ShoppingCart,
      pulse: false,
    },
  ]

  const pipelineSteps = [
    { label: 'Lead Recebido', icon: User, color: '#3B82F6', border: 'border-[#3B82F6]', bg: 'bg-[#3B82F615]' },
    { label: 'IA Responde', icon: Bot, color: '#EAB308', border: 'border-[#EAB308]', bg: 'bg-[#EAB30815]' },
    { label: 'Orçamento Gerado', icon: FileText, color: '#A855F7', border: 'border-[#A855F7]', bg: 'bg-[#A855F715]' },
    { label: 'Venda Fechada', icon: CheckCircle, color: '#22C55E', border: 'border-[#22C55E]', bg: 'bg-[#22C55E15]' },
  ]

  return (
    <div>
      <PageHeader title="Visão da IA" description="Acompanhe sua IA vendedora em ação" />

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statusCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <card.icon size={18} className="text-[#888]" />
              <span className="text-sm text-[#888]">{card.label}</span>
              {card.pulse && (
                <span className="relative flex h-2.5 w-2.5 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
              )}
            </div>
            <p className="text-white font-semibold text-lg">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chat Simulation */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl mb-8 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <Bot size={20} className="text-[#00D4FF]" />
            <span className="text-white font-semibold">Conversa em tempo real</span>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Ao Vivo
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {mockAIConversation.slice(0, visibleCount).map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'client' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{ animation: 'fadeIn 0.4s ease-in' }}
            >
              {msg.role === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00D4FF20] flex items-center justify-center mr-3 mt-1">
                  <Bot size={16} className="text-[#00D4FF]" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-3 ${
                  msg.role === 'client'
                    ? 'bg-[#1a1a1a] rounded-2xl'
                    : 'bg-[#00D4FF15] border border-[#00D4FF30] rounded-2xl'
                }`}
              >
                <p className="text-sm text-white whitespace-pre-line">{msg.message}</p>
                <div className={`flex items-center gap-1 mt-2 ${msg.role === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <Clock size={10} className="text-[#555]" />
                  <span className="text-[10px] text-[#555]">{msg.time}</span>
                </div>
              </div>
              {msg.role === 'client' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center ml-3 mt-1">
                  <User size={16} className="text-[#888]" />
                </div>
              )}
            </div>
          ))}

          {/* Success Banner */}
          {allMessagesShown && (
            <div
              className="mt-6 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4 text-center"
              style={{ animation: 'fadeIn 0.6s ease-in' }}
            >
              <p className="text-green-400 font-semibold">
                ✅ Venda realizada automaticamente — R$ 360,81
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Pipeline */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-6">Pipeline de Automação da IA</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {pipelineSteps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-4">
              <div
                className={`${step.bg} border ${step.border} rounded-2xl px-5 py-4 flex flex-col items-center gap-2 min-w-[150px]`}
              >
                <step.icon size={24} style={{ color: step.color }} />
                <span className="text-white text-sm font-medium text-center">{step.label}</span>
              </div>
              {index < pipelineSteps.length - 1 && (
                <span className="text-[#555] text-2xl hidden sm:block">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
