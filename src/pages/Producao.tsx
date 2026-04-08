import { Package, User, ArrowRight, ArrowLeft, Hash, Calendar, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useData } from '../contexts/DataContext'
import type { ProductionStatus } from '../types'

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

export default function Producao() {
  const { production, moveProductionStatus, loading } = useData()

  const handleMove = (id: string, currentStatus: ProductionStatus, direction: 'left' | 'right') => {
    const currentIndex = statusOrder.indexOf(currentStatus)
    const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0 || nextIndex >= statusOrder.length) return
    moveProductionStatus(id, statusOrder[nextIndex])
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Producao" description="Acompanhe o status dos pedidos em producao" />
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
                        className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#222] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        onClick={() => handleMove(order.id, order.status, 'right')}
                        disabled={colIndex === statusOrder.length - 1}
                        className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#222] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
    </div>
  )
}
