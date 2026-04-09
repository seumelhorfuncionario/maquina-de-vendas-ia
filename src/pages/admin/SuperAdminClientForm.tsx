import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface FeatureRow {
  id: string
  feature_key: string
  feature_name: string
  category: string | null
  is_active: boolean | null
}

const CLIENT_TYPES = [
  { value: 'product_sales', label: 'Venda de Produtos' },
  { value: 'scheduling', label: 'Agendamento' },
  { value: 'services', label: 'Servicos' },
]

export default function SuperAdminClientForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    business_name: '',
    business_niche: '',
    client_type: 'product_sales',
    is_active: true,
    cw_enabled: false,
    cw_account_id: '',
    cw_base_url: '',
    cw_api_token: '',
    agent_whatsapp_id: '',
    agent_instagram_id: '',
    agents_supabase_ref: 'wacotfqoarsbazrreeco',
    dashboard_config: {
      leads_today: true,
      leads_month: true,
      conversions: true,
      conversion_rate: true,
      revenue: true,
      traffic_cost: true,
      material_cost: true,
      profit: true,
    } as Record<string, boolean>,
  })

  const [allFeatures, setAllFeatures] = useState<FeatureRow[]>([])
  const [enabledFeatureIds, setEnabledFeatureIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFeatures()
    if (isEditing) loadClient()
  }, [id])

  const loadFeatures = async () => {
    const { data } = await supabase
      .from('features')
      .select('id, feature_key, feature_name, category, is_active')
      .eq('is_active', true)
      .order('category')
      .order('feature_name')

    setAllFeatures(data || [])
  }

  const loadClient = async () => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id!)
        .single()

      if (client) {
        setForm({
          email: client.email,
          password: '',
          business_name: client.business_name,
          business_niche: client.business_niche,
          client_type: client.client_type || 'product_sales',
          is_active: client.is_active !== false,
          cw_enabled: client.cw_enabled || false,
          cw_account_id: client.cw_account_id || '',
          cw_base_url: client.cw_base_url || '',
          cw_api_token: client.cw_api_token || '',
          agent_whatsapp_id: client.agent_whatsapp_id ? String(client.agent_whatsapp_id) : '',
          agent_instagram_id: client.agent_instagram_id ? String(client.agent_instagram_id) : '',
          agents_supabase_ref: client.agents_supabase_ref || 'wacotfqoarsbazrreeco',
          dashboard_config: (client.dashboard_config as Record<string, boolean>) || {
            leads_today: true, leads_month: true, conversions: true, conversion_rate: true,
            revenue: true, traffic_cost: true, material_cost: true, profit: true,
          },
        })

        // Load client features
        const { data: cfData } = await supabase
          .from('client_features')
          .select('feature_id')
          .eq('client_id', id!)
          .eq('is_enabled', true)

        setEnabledFeatureIds(new Set((cfData || []).map(cf => cf.feature_id)))
      }
    } catch (err) {
      console.error('Error loading client:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = (featureId: string) => {
    setEnabledFeatureIds(prev => {
      const next = new Set(prev)
      if (next.has(featureId)) {
        next.delete(featureId)
      } else {
        next.add(featureId)
      }
      return next
    })
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)

    try {
      let clientId = id

      if (isEditing) {
        // Update client record
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            email: form.email,
            business_name: form.business_name,
            business_niche: form.business_niche,
            client_type: form.client_type,
            is_active: form.is_active,
            cw_enabled: form.cw_enabled,
            cw_account_id: form.cw_account_id || null,
            cw_base_url: form.cw_base_url || null,
            cw_api_token: form.cw_api_token || null,
            agent_whatsapp_id: form.agent_whatsapp_id ? Number(form.agent_whatsapp_id) : null,
            agent_instagram_id: form.agent_instagram_id ? Number(form.agent_instagram_id) : null,
            agents_supabase_ref: form.agents_supabase_ref || null,
            dashboard_config: form.dashboard_config,
          })
          .eq('id', id!)

        if (updateError) throw updateError
      } else {
        // Create user via signUp
        if (!form.email || !form.password) {
          setError('Email e senha sao obrigatorios para criar um novo cliente.')
          setSaving(false)
          return
        }

        // Criar user via RPC (nao usa signUp pra nao trocar a session do admin)
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('create_auth_user' as any, { p_email: form.email, p_password: form.password })

        if (rpcError) throw rpcError

        const authUserId = rpcResult as string
        if (!authUserId) throw new Error('Erro ao criar usuario de autenticacao')

        // Insert client record
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert({
            auth_user_id: authUserId,
            email: form.email,
            business_name: form.business_name,
            business_niche: form.business_niche,
            client_type: form.client_type,
            is_active: form.is_active,
            cw_enabled: form.cw_enabled,
            cw_account_id: form.cw_account_id || null,
            cw_base_url: form.cw_base_url || null,
            cw_api_token: form.cw_api_token || null,
            agent_whatsapp_id: form.agent_whatsapp_id ? Number(form.agent_whatsapp_id) : null,
            agent_instagram_id: form.agent_instagram_id ? Number(form.agent_instagram_id) : null,
            agents_supabase_ref: form.agents_supabase_ref || null,
            dashboard_config: form.dashboard_config,
          })
          .select('id')
          .single()

        if (insertError) throw insertError
        clientId = newClient?.id
      }

      // Sync features
      if (clientId) {
        // Delete all existing
        await supabase
          .from('client_features')
          .delete()
          .eq('client_id', clientId)

        // Insert enabled ones
        if (enabledFeatureIds.size > 0) {
          const rows = Array.from(enabledFeatureIds).map(featureId => ({
            client_id: clientId!,
            feature_id: featureId,
            is_enabled: true,
            enabled_at: new Date().toISOString(),
          }))

          const { error: cfError } = await supabase
            .from('client_features')
            .insert(rows)

          if (cfError) throw cfError
        }
      }

      navigate('/super-admin/clients')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar cliente'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm(`Tem certeza que deseja excluir "${form.business_name}"? Esta ação não pode ser desfeita.`)) return

    setDeleting(true)
    setError('')

    try {
      // Deletar client_features primeiro (FK)
      await supabase.from('client_features').delete().eq('client_id', id)
      // Deletar chats
      await supabase.from('chats').delete().eq('client_id', id)
      // Deletar leads
      await supabase.from('leads').delete().eq('client_id', id)
      // Deletar sales
      await supabase.from('sales').delete().eq('client_id', id)
      // Deletar dashboard_metrics
      await supabase.from('dashboard_metrics').delete().eq('client_id', id)
      // Deletar funnel_stages
      await supabase.from('funnel_stages').delete().eq('client_id', id)
      // Deletar products
      await supabase.from('products').delete().eq('client_id', id)
      // Deletar o client
      const { error: deleteError } = await supabase.from('clients').delete().eq('id', id)
      if (deleteError) throw deleteError

      navigate('/super-admin/clients')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir cliente'
      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  // Group features by category
  const featuresByCategory = allFeatures.reduce<Record<string, FeatureRow[]>>((acc, f) => {
    const cat = f.category || 'Geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
        <span className="ml-3 text-sm text-neutral-500">Carregando...</span>
      </div>
    )
  }

  const inputClass =
    'w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00D4FF] transition-colors'

  return (
    <div className="max-w-3xl">
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/super-admin/clients')}
          className="p-2 rounded-lg hover:bg-[#111] text-[#888] hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-sm text-[#888] mt-1">
            {isEditing ? 'Altere os dados do cliente' : 'Preencha os dados para criar um novo cliente'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[#FF4D6A18] border border-[#FF4D6A30] text-[#FF4D6A] text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="text-base font-semibold text-white mb-4">Dados Basicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#888] mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="email@exemplo.com"
              />
            </div>
            {!isEditing && (
              <div>
                <label className="text-sm text-[#888] mb-1 block">Senha</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={inputClass}
                  placeholder="Senha do usuario"
                />
              </div>
            )}
            <div>
              <label className="text-sm text-[#888] mb-1 block">Nome da Empresa</label>
              <input
                type="text"
                value={form.business_name}
                onChange={e => setForm({ ...form, business_name: e.target.value })}
                className={inputClass}
                placeholder="Nome da empresa"
              />
            </div>
            <div>
              <label className="text-sm text-[#888] mb-1 block">Nicho</label>
              <input
                type="text"
                value={form.business_niche}
                onChange={e => setForm({ ...form, business_niche: e.target.value })}
                className={inputClass}
                placeholder="Ex: cosmeticos, educacao"
              />
            </div>
            <div>
              <label className="text-sm text-[#888] mb-1 block">Tipo de Cliente</label>
              <select
                value={form.client_type}
                onChange={e => setForm({ ...form, client_type: e.target.value })}
                className={inputClass}
              >
                {CLIENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
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
              <span className="text-sm text-[#888]">Cliente ativo</span>
            </div>
          </div>
        </div>

        {/* Chatwoot */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Chatwoot</h2>
            <button
              type="button"
              onClick={() => setForm({ ...form, cw_enabled: !form.cw_enabled })}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                form.cw_enabled ? 'bg-[#00FF88]' : 'bg-[#333]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  form.cw_enabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          {form.cw_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#888] mb-1 block">Account ID</label>
                <input
                  type="text"
                  value={form.cw_account_id}
                  onChange={e => setForm({ ...form, cw_account_id: e.target.value })}
                  className={inputClass}
                  placeholder="ID da conta Chatwoot"
                />
              </div>
              <div>
                <label className="text-sm text-[#888] mb-1 block">Base URL</label>
                <input
                  type="text"
                  value={form.cw_base_url}
                  onChange={e => setForm({ ...form, cw_base_url: e.target.value })}
                  className={inputClass}
                  placeholder="https://chatwoot.exemplo.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-[#888] mb-1 block">API Token</label>
                <input
                  type="text"
                  value={form.cw_api_token}
                  onChange={e => setForm({ ...form, cw_api_token: e.target.value })}
                  className={inputClass}
                  placeholder="Token de API do Chatwoot"
                />
              </div>
            </div>
          )}
        </div>

        {/* Agentes IA */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Agentes IA</h2>
            <span className="text-[10px] text-[#555] font-mono">{form.agents_supabase_ref || '—'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#888] mb-1 block">ID Agente WhatsApp</label>
              <input
                type="number"
                value={form.agent_whatsapp_id}
                onChange={e => setForm({ ...form, agent_whatsapp_id: e.target.value })}
                className={inputClass}
                placeholder="Ex: 36"
              />
            </div>
            <div>
              <label className="text-sm text-[#888] mb-1 block">ID Agente Instagram</label>
              <input
                type="number"
                value={form.agent_instagram_id}
                onChange={e => setForm({ ...form, agent_instagram_id: e.target.value })}
                className={inputClass}
                placeholder="Ex: 37"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-[#888] mb-1 block">Supabase Ref (banco dos agentes)</label>
              <input
                type="text"
                value={form.agents_supabase_ref}
                onChange={e => setForm({ ...form, agents_supabase_ref: e.target.value })}
                className={inputClass}
                placeholder="wacotfqoarsbazrreeco"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="text-base font-semibold text-white mb-4">Cards do Dashboard</h2>
          <p className="text-xs text-[#888] mb-4">Escolha quais cards aparecem no dashboard deste cliente</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { key: 'leads_today', label: 'Leads Hoje' },
              { key: 'leads_month', label: 'Leads no Mês' },
              { key: 'conversions', label: 'Vendas Convertidas' },
              { key: 'conversion_rate', label: 'Taxa de Conversão' },
              { key: 'revenue', label: 'Receita Total' },
              { key: 'traffic_cost', label: 'Custo com Tráfego' },
              { key: 'material_cost', label: 'Custo com Materiais' },
              { key: 'profit', label: 'Lucro Líquido' },
            ].map(card => (
              <label
                key={card.key}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                  form.dashboard_config[card.key]
                    ? 'bg-[#00D4FF10] border-[#00D4FF30] text-white'
                    : 'bg-[#111] border-[#1a1a1a] text-[#888] hover:text-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.dashboard_config[card.key] ?? true}
                  onChange={() => setForm({
                    ...form,
                    dashboard_config: { ...form.dashboard_config, [card.key]: !form.dashboard_config[card.key] },
                  })}
                  className="accent-[#00D4FF]"
                />
                <span className="text-sm font-medium">{card.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="text-base font-semibold text-white mb-4">
            Features ({enabledFeatureIds.size}/{allFeatures.length})
          </h2>
          {Object.entries(featuresByCategory).map(([category, features]) => (
            <div key={category} className="mb-4 last:mb-0">
              <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {features.map(feature => (
                  <label
                    key={feature.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                      enabledFeatureIds.has(feature.id)
                        ? 'bg-[#00D4FF10] border-[#00D4FF30] text-white'
                        : 'bg-[#111] border-[#1a1a1a] text-[#888] hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={enabledFeatureIds.has(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="accent-[#00D4FF]"
                    />
                    <div>
                      <span className="text-sm font-medium">{feature.feature_name}</span>
                      <span className="text-xs text-[#555] ml-2">{feature.feature_key}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {allFeatures.length === 0 && (
            <p className="text-sm text-[#888]">Nenhuma feature cadastrada</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/super-admin/clients')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#111] transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 bg-[#FF4D6A18] hover:bg-[#FF4D6A30] border border-[#FF4D6A30] disabled:opacity-50 text-[#FF4D6A] font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {deleting ? 'Excluindo...' : 'Excluir'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-[#00FF88] hover:bg-[#00cc6e] disabled:opacity-50 text-black font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
