import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Package, Save, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useData } from '../contexts/DataContext'
import type { Product } from '../types'

const emptyForm = { name: '', size: '', price: 0, cost: 0 }

interface ProductModalProps {
  editingId: string | null
  form: typeof emptyForm
  setForm: (f: typeof emptyForm) => void
  currentMargin: number
  marginColor: (m: number) => string
  onClose: () => void
  onSave: () => void
}

function ProductModal({ editingId, form, setForm, currentMargin, marginColor, onClose, onSave }: ProductModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {editingId ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-lg hover:bg-[#111] text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-[#888] mb-1 block">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#00D4FF] transition-colors"
              placeholder="Nome do produto"
            />
          </div>

          <div>
            <label className="text-sm text-[#888] mb-1 block">Tamanho</label>
            <input
              type="text"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#00D4FF] transition-colors"
              placeholder="Ex: 30ml, 100ml"
            />
          </div>

          <div>
            <label className="text-sm text-[#888] mb-1 block">Preço de Venda</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#00D4FF] transition-colors"
              placeholder="0,00"
              min={0}
              step={0.01}
            />
          </div>

          <div>
            <label className="text-sm text-[#888] mb-1 block">Custo de Produção</label>
            <input
              type="number"
              value={form.cost || ''}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#00D4FF] transition-colors"
              placeholder="0,00"
              min={0}
              step={0.01}
            />
          </div>

          <div className="bg-[#111] rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-[#888]">Margem calculada</span>
            <span className={`font-bold ${marginColor(currentMargin)}`}>
              {currentMargin.toFixed(1)}%
            </span>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#111] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00b8e0] text-black font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Save size={16} />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Produtos() {
  const { products, addProduct, updateProduct, deleteProduct, loading } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const calcMargin = (price: number, cost: number) =>
    price > 0 ? ((price - cost) / price) * 100 : 0

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({ name: product.name, size: product.size, price: product.price, cost: product.cost })
    setModalOpen(true)
  }

  const handleSave = () => {
    const margin = Number(calcMargin(form.price, form.cost).toFixed(1))
    if (editingId) {
      updateProduct({ id: editingId, name: form.name, size: form.size, price: form.price, cost: form.cost, margin })
    } else {
      addProduct({ id: 'p' + Date.now(), name: form.name, size: form.size, price: form.price, cost: form.cost, margin })
    }
    setModalOpen(false)
  }

  const marginColor = (margin: number) =>
    margin > 70 ? 'text-green-400' : margin > 50 ? 'text-yellow-400' : 'text-red-400'

  const marginBarColor = (margin: number) =>
    margin > 70 ? 'bg-green-400' : margin > 50 ? 'bg-yellow-400' : 'bg-red-400'

  const currentMargin = calcMargin(form.price, form.cost)

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastro e gestão de produtos"
        action={
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-[#00FF88] hover:bg-[#00cc6e] text-black font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={18} />
            Novo Produto
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando produtos...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#888]">
          <Package size={48} className="mb-4 opacity-50" />
          <p className="text-lg">Nenhum produto cadastrado</p>
          <p className="text-sm mt-1">Clique em &quot;Novo Produto&quot; para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-5 flex flex-col gap-3 card-glow animate-card-in relative overflow-hidden"
              style={{ '--glow-color': '#00FF88', animationDelay: `${i * 0.05}s` } as React.CSSProperties}
            >
              <div className="absolute top-0 left-0 right-0 h-px opacity-30 bg-gradient-to-r from-transparent via-[#00FF8840] to-transparent" />

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white tracking-tight">{product.name}</h3>
                  <span className="inline-block mt-1 text-[11px] bg-[#111] text-[#666] rounded-md px-2 py-0.5 font-medium">
                    {product.size}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(product)}
                    aria-label={`Editar ${product.name}`}
                    className="p-2 rounded-lg hover:bg-[#111] text-[#555] hover:text-white transition-colors cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`Excluir "${product.name}"?`)) deleteProduct(product.id) }}
                    aria-label={`Excluir ${product.name}`}
                    className="p-2 rounded-lg hover:bg-[#111] text-[#555] hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-2xl font-bold font-data text-[#00FF88]">
                  {formatCurrency(product.price)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666] font-data text-[12px]">Custo: {formatCurrency(product.cost)}</span>
                <span className={`font-bold font-data ${marginColor(product.margin)}`}>
                  {product.margin.toFixed(1)}%
                </span>
              </div>

              <div className="w-full h-1 bg-[#111] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${marginBarColor(product.margin)} transition-all duration-500`}
                  style={{ width: `${Math.min(product.margin, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal
          editingId={editingId}
          form={form}
          setForm={setForm}
          currentMargin={currentMargin}
          marginColor={marginColor}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
