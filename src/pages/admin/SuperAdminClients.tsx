import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, Pencil, Loader2, Users, Copy, Check, ExternalLink, Link2, Puzzle, BarChart3, AlertTriangle } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { supabase } from '@/integrations/supabase/client'

interface ClientRow {
  id: string
  business_name: string
  email: string
  business_niche: string
  client_type: string | null
  cw_enabled: boolean | null
  is_active: boolean | null
  embed_token: string | null
}

export default function SuperAdminClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedEmbed, setCopiedEmbed] = useState<string | null>(null)
  const [totalFeatures, setTotalFeatures] = useState(0)
  const [avgCoverage, setAvgCoverage] = useState(0)
  const [clientsWithZero, setClientsWithZero] = useState(0)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      // Fetch em paralelo: clientes + features ativas + client_features pra calcular cobertura
      const [{ data: clientsData }, { count: featuresCount }, { data: cfData }] = await Promise.all([
        supabase
          .from('clients')
          .select('id, business_name, email, business_niche, client_type, cw_enabled, is_active, embed_token')
          .order('business_name'),
        supabase.from('features').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('client_features').select('client_id, is_enabled'),
      ])

      const allClients = clientsData || []
      const activeClients = allClients.filter(c => c.is_active !== false)
      const totalFeat = featuresCount || 0

      let totalCoverage = 0
      let zeroCount = 0
      for (const client of activeClients) {
        const enabledCount = (cfData || []).filter(cf => cf.client_id === client.id && cf.is_enabled).length
        if (enabledCount === 0) zeroCount++
        if (totalFeat > 0) totalCoverage += (enabledCount / totalFeat) * 100
      }
      const avg = activeClients.length > 0 ? totalCoverage / activeClients.length : 0

      setClients(allClients)
      setTotalFeatures(totalFeat)
      setAvgCoverage(Math.round(avg))
      setClientsWithZero(zeroCount)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeCount = useMemo(() => clients.filter(c => c.is_active !== false).length, [clients])

  const toggleActive = async (client: ClientRow) => {
    const newStatus = client.is_active === false ? true : false
    const { error } = await supabase
      .from('clients')
      .update({ is_active: newStatus })
      .eq('id', client.id)

    if (!error) {
      setClients(prev =>
        prev.map(c => (c.id === client.id ? { ...c, is_active: newStatus } : c))
      )
    }
  }

  const handleViewDashboard = (clientId: string) => {
    localStorage.setItem('selectedClientId', clientId)
    // Full reload ao inves de navigate() pra garantir que o TenantContext
    // refetcha features do cliente novo e o bundle JS mais recente e baixado
    // (super admin pode estar com state stale da sessao anterior).
    window.location.href = '/'
  }

  const buildEmbedUrl = (client: ClientRow, page = 'dashboard') => {
    const base = window.location.origin
    const params = new URLSearchParams({ page, chrome: 'banner-only' })
    if (client.embed_token) params.set('token', client.embed_token)
    return `${base}/embed/${client.id}?${params.toString()}`
  }

  const handleCopyEmbed = (client: ClientRow) => {
    navigator.clipboard.writeText(buildEmbedUrl(client))
    setCopiedEmbed(client.id)
    setTimeout(() => setCopiedEmbed(null), 2000)
  }

  const handleOpenEmbed = (client: ClientRow) => {
    window.open(buildEmbedUrl(client), '_blank', 'noopener,noreferrer')
  }

  const filtered = clients.filter(c => {
    const matchesSearch =
      !search ||
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.is_active !== false) ||
      (statusFilter === 'inactive' && c.is_active === false)

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
        <span className="ml-3 text-sm text-neutral-500">Carregando clientes...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header -- stack em mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Painel Super Admin</h1>
          <p className="text-xs sm:text-sm text-[#888] mt-1">Visão geral e gerenciamento de clientes</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/clients/new')}
          className="flex items-center justify-center gap-2 bg-[#00FF88] hover:bg-[#00cc6e] text-black font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Clientes Ativos"
          value={activeCount}
          icon={<Users size={18} />}
          color="positive"
        />
        <StatCard
          title="Total de Features"
          value={totalFeatures}
          icon={<Puzzle size={18} />}
          color="neutral"
        />
        <StatCard
          title="Cobertura Média"
          value={`${avgCoverage}%`}
          icon={<BarChart3 size={18} />}
          color="positive"
        />
        <StatCard
          title="Clientes sem Features"
          value={clientsWithZero}
          icon={<AlertTriangle size={18} />}
          color={clientsWithZero > 0 ? 'warning' : 'positive'}
        />
      </div>

      {/* Filters -- stack em mobile pra nao apertar busca com 3 botoes ao lado */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#00D4FF] transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'inactive'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF30]'
                  : 'bg-[#111] text-[#888] hover:text-white'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista mobile (< md): cards stacked. Desktop: tabela 8-col. */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a]">
            <Users size={32} className="mx-auto mb-3 text-[#555]" />
            <p className="text-sm text-[#888]">Nenhum cliente encontrado</p>
          </div>
        ) : (
          filtered.map(client => (
            <div key={client.id} className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-white truncate">{client.business_name}</span>
                    <span
                      className={`inline-flex shrink-0 w-1.5 h-1.5 rounded-full ${client.cw_enabled ? 'bg-[#00FF88]' : 'bg-[#555]'}`}
                      title={client.cw_enabled ? 'CRM conectado' : 'CRM desconectado'}
                    />
                  </div>
                  <div className="text-xs text-[#888] truncate">{client.email}</div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] text-[#666]">{client.business_niche}</span>
                    {client.client_type && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#111] text-[#888] border border-[#1a1a1a]">
                        {client.client_type}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(client)}
                  className={`relative w-10 h-5 shrink-0 rounded-full transition-colors ${client.is_active !== false ? 'bg-[#00FF88]' : 'bg-[#333]'}`}
                  title={client.is_active !== false ? 'Ativo — toque pra desativar' : 'Inativo — toque pra ativar'}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${client.is_active !== false ? 'translate-x-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(client.id)
                    setCopiedId(client.id)
                    setTimeout(() => setCopiedId(null), 2000)
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-[#666] hover:text-[#00D4FF] transition-colors"
                >
                  {client.id.slice(0, 8)}
                  {copiedId === client.id ? <Check size={10} className="text-[#00FF88]" /> : <Copy size={10} />}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleViewDashboard(client.id)}
                    className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-[#00D4FF] transition-colors"
                    aria-label="Ver painel"
                    title="Ver painel"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenEmbed(client)}
                    className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-[#A855F7] transition-colors"
                    aria-label="Abrir embed"
                    title="Abrir embed"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={() => handleCopyEmbed(client)}
                    className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-[#00FF88] transition-colors"
                    aria-label="Copiar link embed"
                    title="Copiar link embed"
                  >
                    {copiedEmbed === client.id ? <Check size={16} className="text-[#00FF88]" /> : <Link2 size={16} />}
                  </button>
                  <button
                    onClick={() => navigate(`/super-admin/clients/${client.id}/edit`)}
                    className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-white transition-colors"
                    aria-label="Editar"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table desktop (md+): rolagem interna se viewport apertar mas sem vazar pro body */}
      <div className="hidden md:block rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="bg-[#111] text-[#888]">
              <th className="text-left px-5 py-3 font-medium">ID</th>
              <th className="text-left px-5 py-3 font-medium">Empresa</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Nicho</th>
              <th className="text-left px-5 py-3 font-medium">Tipo</th>
              <th className="text-center px-5 py-3 font-medium">CRM</th>
              <th className="text-center px-5 py-3 font-medium">Ativo</th>
              <th className="text-right px-5 py-3 font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <tr
                key={client.id}
                className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors"
              >
                <td className="px-5 py-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(client.id)
                      setCopiedId(client.id)
                      setTimeout(() => setCopiedId(null), 2000)
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[#666] hover:text-[#00D4FF] transition-colors cursor-pointer"
                    title={client.id}
                  >
                    {client.id.slice(0, 8)}...
                    {copiedId === client.id ? <Check size={11} className="text-[#00FF88]" /> : <Copy size={11} />}
                  </button>
                </td>
                <td className="px-5 py-3 text-white font-medium">{client.business_name}</td>
                <td className="px-5 py-3 text-[#888]">{client.email}</td>
                <td className="px-5 py-3 text-[#ccc]">{client.business_niche}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-[#111] text-[#888] text-xs border border-[#1a1a1a]">
                    {client.client_type || '-'}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-flex w-2 h-2 rounded-full ${
                      client.cw_enabled ? 'bg-[#00FF88]' : 'bg-[#555]'
                    }`}
                  />
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => toggleActive(client)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      client.is_active !== false ? 'bg-[#00FF88]' : 'bg-[#333]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        client.is_active !== false ? 'left-5.5 translate-x-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleViewDashboard(client.id)}
                      className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-[#00D4FF] transition-colors"
                      title="Ver painel como admin"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenEmbed(client)}
                      className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-[#A855F7] transition-colors"
                      title="Abrir modo embed (nova aba)"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={() => handleCopyEmbed(client)}
                      className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-[#00FF88] transition-colors relative"
                      title="Copiar link de embed (para Chatwoot)"
                    >
                      {copiedEmbed === client.id ? (
                        <Check size={16} className="text-[#00FF88]" />
                      ) : (
                        <Link2 size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/super-admin/clients/${client.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <Users size={36} className="mx-auto mb-3 text-[#555]" />
                  <p className="text-[#888]">Nenhum cliente encontrado</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
