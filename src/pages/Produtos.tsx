import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Package, Save, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useData } from '../contexts/DataContext'
import type { Product } from '../types'

const emptyForm = { name: '', size: '', price: 0, cost: 0 }

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
        description="Cadastro e gestao de produtos"
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
          <p className="text-sm mt-1">Clique em &quot;Novo Produto&quot; para comecar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white">{product.name}</h3>
                  <span className="inline-block mt-1 text-xs bg-[#111] text-[#888] rounded-lg px-2 py-0.5">
                    {product.size}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-lg hover:bg-[#111] text-[#888] hover:text-white transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 rounded-lg hover:bg-[#111] text-[#888] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-2xl font-bold text-[#00FF88]">
                  {formatCurrency(product.price)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#888]">Custo: {formatCurrency(product.cost)}</span>
                <span className={`font-semibold ${marginColor(product.margin)}`}>
                  {product.margin.toFixed(1)}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#111] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${marginBarColor(product.margin)}`}
                  style={{ width: `${Math.min(product.margin, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-[#111] text-[#888] hover:text-white transition-colors"
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
                <label className="text-sm text-[#888] mb-1 block">Preco de Venda</label>
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
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00b8e0] text-black font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Save size={16} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
