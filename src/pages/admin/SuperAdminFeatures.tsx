import { useEffect, useState } from 'react'
import { Plus, Pencil, Archive, X, Save, Loader2, Puzzle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface FeatureRow {
  id: string
  feature_key: string
  feature_name: string
  description: string | null
  category: string | null
  is_active: boolean | null
}

const emptyForm = {
  feature_key: '',
  feature_name: '',
  description: '',
  category: '',
  is_active: true,
}

export default function SuperAdminFeatures() {
  const [features, setFeatures] = useState<FeatureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadFeatures()
  }, [])

  const loadFeatures = async () => {
    try {
      const { data } = await supabase
        .from('features')
        .select('id, feature_key, feature_name, description, category, is_active')
        .order('category')
        .order('feature_name')

      setFeatures(data || [])
    } catch (error) {
      console.error('Error loading features:', error)
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (feature: FeatureRow) => {
    setEditingId(feature.id)
    setForm({
      feature_key: feature.feature_key,
      feature_name: feature.feature_name,
      description: feature.description || '',
      category: feature.category || '',
      is_active: feature.is_active !== false,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.feature_key || !form.feature_name) return
    setSaving(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('features')
          .update({
            feature_key: form.feature_key,
            feature_name: form.feature_name,
            description: form.description || null,
            category: form.category || null,
            is_active: form.is_active,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('features')
          .insert({
            feature_key: form.feature_key,
            feature_name: form.feature_name,
            description: form.description || null,
            category: form.category || null,
            is_active: form.is_active,
          })

        if (error) throw error
      }

      setModalOpen(false)
      await loadFeatures()
    } catch (error) {
      console.error('Error saving feature:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async (feature: FeatureRow) => {
    const newStatus = !feature.is_active
    const { error } = await supabase
      .from('features')
      .update({ is_active: newStatus })
      .eq('id', feature.id)

    if (!error) {
      setFeatures(prev =>
        prev.map(f => (f.id === feature.id ? { ...f, is_active: newStatus } : f))
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
        <span className="ml-3 text-sm text-neutral-500">Carregando features...</span>
      </div>
    )
  }

  const inputClass =
    'w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00D4FF] transition-colors'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Features</h1>
          <p className="text-sm text-[#888] mt-1">Gerencie as features disponíveis na plataforma</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#00FF88] hover:bg-[#00cc6e] text-black font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} />
          Nova Feature
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111] text-[#888]">
              <th className="text-left px-5 py-3 font-medium">Chave</th>
              <th className="text-left px-5 py-3 font-medium">Nome</th>
              <th className="text-left px-5 py-3 font-medium">Categoria</th>
              <th className="text-center px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {features.map(feature => (
              <tr
                key={feature.id}
                className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors"
              >
                <td className="px-5 py-3">
                  <code className="text-[#00D4FF] bg-[#00D4FF10] px-2 py-0.5 rounded text-xs">
                    {feature.feature_key}
                  </code>
                </td>
                <td className="px-5 py-3 text-white font-medium">{feature.feature_name}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-[#111] text-[#888] text-xs border border-[#1a1a1a]">
                    {feature.category || 'Geral'}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      feature.is_active !== false
                        ? 'bg-[#00FF8818] text-[#00FF88] border border-[#00FF8830]'
                        : 'bg-[#FF4D6A18] text-[#FF4D6A] border border-[#FF4D6A30]'
                    }`}
                  >
                    {feature.is_active !== false ? 'Ativa' : 'Arquivada'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(feature)}
                      className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleArchive(feature)}
                      className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-yellow-400 transition-colors"
                      title={feature.is_active !== false ? 'Arquivar' : 'Reativar'}
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {features.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <Puzzle size={36} className="mx-auto mb-3 text-[#555]" />
                  <p className="text-[#888]">Nenhuma feature cadastrada</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Editar Feature' : 'Nova Feature'}
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
                <label className="text-sm text-[#888] mb-1 block">Chave (feature_key)</label>
                <input
                  type="text"
                  value={form.feature_key}
                  onChange={e => setForm({ ...form, feature_key: e.target.value })}
                  className={inputClass}
                  placeholder="ex: dashboard_analytics"
                />
              </div>
              <div>
                <label className="text-sm text-[#888] mb-1 block">Nome</label>
                <input
                  type="text"
                  value={form.feature_name}
                  onChange={e => setForm({ ...form, feature_name: e.target.value })}
                  className={inputClass}
                  placeholder="ex: Analytics do Dashboard"
                />
              </div>
              <div>
                <label className="text-sm text-[#888] mb-1 block">Descricao</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none h-20`}
                  placeholder="Descricao da feature..."
                />
              </div>
              <div>
                <label className="text-sm text-[#888] mb-1 block">Categoria</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                  placeholder="ex: dashboard, ia, integracao"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    form.is_active ? 'bg-[#00FF88]' : 'bg-[#333]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      form.is_active ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className="text-sm text-[#888]">Feature ativa</span>
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
                  disabled={saving || !form.feature_key || !form.feature_name}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00b8e0] disabled:opacity-50 text-black font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
