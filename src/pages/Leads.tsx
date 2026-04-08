import { useMemo, useState, useRef } from 'react'
import { User, Phone, Tag, Calendar, Globe, GripVertical, ArrowRight, Loader2, Zap } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { useKanbanSync } from '@/hooks/useKanbanSync'
import type { Lead, LeadStatus } from '../types'

// Colunas fallback para demo mode
const defaultColumns: { status: LeadStatus; title: string; color: string }[] = [
  { status: 'Novo Lead', title: 'Novo Lead', color: '#6366f1' },
  { status: 'Qualificando', title: 'Qualificando', color: '#8b5cf6' },
  { status: 'Orçamento Enviado', title: 'Orçamento Enviado', color: '#ec4899' },
  { status: 'Negociando', title: 'Negociando', color: '#10b981' },
  { status: 'Venda Fechada', title: 'Venda Fechada', color: '#22c55e' },
]

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

export default function Leads() {
  const { leads, moveLeadStatus, loading } = useData()
  const { isDemo } = useAuth()
  const { funnelStages } = useTenant()
  const { syncMoveToStage, isConnected } = useKanbanSync()
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const dragCounter = useRef<Record<string, number>>({})

  // Colunas dinamicas do TenantContext ou fallback para demo
  const columns = useMemo(() => {
    if (isDemo || funnelStages.length === 0) return defaultColumns

    return funnelStages.map(stage => ({
      status: stage.stage_name as LeadStatus,
      title: stage.stage_name,
      color: stage.color || (stage.is_conversion ? '#00FF88' : stage.is_qualified ? '#A855F7' : '#00D4FF'),
    }))
  }, [isDemo, funnelStages])

  const statusOrder = useMemo(() => columns.map(c => c.status), [columns])

  const getLeadsByStatus = (status: LeadStatus) =>
    leads.filter((l) => l.status === status)

  const handleMove = async (lead: Lead, newStatus: LeadStatus) => {
    moveLeadStatus(lead.id, newStatus)
    // Sync com Kanban StackLab se tiver id_kanban
    if (lead.kanbanItemId) {
      await syncMoveToStage(lead.kanbanItemId, newStatus as string)
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
    // Estilo ghost
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLead(null)
    setDropTarget(null)
    dragCounter.current = {}
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragEnter = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    dragCounter.current[status] = (dragCounter.current[status] || 0) + 1
    setDropTarget(status)
  }

  const handleDragLeave = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    dragCounter.current[status] = (dragCounter.current[status] || 0) - 1
    if (dragCounter.current[status] <= 0) {
      dragCounter.current[status] = 0
      if (dropTarget === status) setDropTarget(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault()
    setDropTarget(null)
    dragCounter.current = {}
    if (draggedLead && draggedLead.status !== newStatus) {
      handleMove(draggedLead, newStatus)
    }
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
      />

      {isConnected && (
        <div className="flex items-center gap-2 mb-4 text-xs text-[#00FF88]">
          <Zap size={12} />
          <span>Sincronizado com Kanban</span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colLeads = getLeadsByStatus(col.status)
          const isOver = dropTarget === col.status && draggedLead?.status !== col.status

          return (
            <div
              key={col.status}
              className={`min-w-[280px] flex-1 rounded-2xl border p-4 flex flex-col transition-all duration-200 ${
                isOver
                  ? 'bg-[#111] border-[#00D4FF50] shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                  : 'bg-[#0a0a0a] border-[#1a1a1a]'
              }`}
              onDragEnter={(e) => handleDragEnter(e, col.status)}
              onDragLeave={(e) => handleDragLeave(e, col.status)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              {/* Column Header */}
              <div
                className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1a1a1a] pl-3"
                style={{ borderLeftWidth: 3, borderLeftColor: col.color }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="text-sm font-semibold text-white flex-1">
                  {col.title}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: col.color + '20',
                    color: col.color,
                  }}
                >
                  {colLeads.length}
                </span>
              </div>

              {/* Drop zone indicator */}
              {isOver && (
                <div className="border-2 border-dashed border-[#00D4FF40] rounded-xl p-3 mb-3 text-center text-xs text-[#00D4FF60]">
                  Soltar aqui
                </div>
              )}

              {/* Cards */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                    className="bg-[#111] rounded-xl border border-[#1a1a1a] p-3 hover:border-[#333] transition-colors group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical size={14} className="text-[#444] flex-shrink-0 group-hover:text-[#888]" />
                      <span className="text-sm font-bold text-white truncate">
                        {lead.name}
                      </span>
                      {lead.kanbanItemId && (
                        <span title="Vinculado ao Kanban"><Zap size={10} className="text-[#00FF88] flex-shrink-0" /></span>
                      )}
                    </div>

                    <div className="space-y-1.5 ml-[22px]">
                      <div className="flex items-center gap-2 text-xs text-[#888]">
                        <Phone size={12} className="flex-shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.product && (
                        <div className="flex items-center gap-2 text-xs text-[#888]">
                          <Tag size={12} className="flex-shrink-0" />
                          <span className="truncate">{lead.product}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[#888]">
                        <Globe size={12} className="flex-shrink-0" />
                        <span>{lead.origin}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#888]">
                        <Calendar size={12} className="flex-shrink-0" />
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                      {lead.value != null && (
                        <div className="text-xs font-semibold" style={{ color: col.color }}>
                          {formatCurrency(lead.value)}
                        </div>
                      )}
                    </div>

                    {/* Move buttons */}
                    <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-[#1a1a1a]">
                      {statusOrder.indexOf(col.status) > 0 && (
                        <button
                          onClick={() => handleMove(lead, statusOrder[statusOrder.indexOf(col.status) - 1])}
                          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#888] hover:text-white transition-colors"
                          title={`Mover para ${columns[statusOrder.indexOf(col.status) - 1]?.title}`}
                        >
                          <ArrowRight size={14} className="rotate-180" />
                        </button>
                      )}
                      {statusOrder.indexOf(col.status) < statusOrder.length - 1 && (
                        <button
                          onClick={() => handleMove(lead, statusOrder[statusOrder.indexOf(col.status) + 1])}
                          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#888] hover:text-white transition-colors"
                          title={`Mover para ${columns[statusOrder.indexOf(col.status) + 1]?.title}`}
                        >
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && !isOver && (
                  <div className="flex flex-col items-center justify-center py-8 text-[#444]">
                    <User size={24} className="mb-2" />
                    <span className="text-xs">Nenhum lead</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
