import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, Pencil, Loader2, Users, Copy, Check } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface ClientRow {
  id: string
  business_name: string
  email: string
  business_niche: string
  client_type: string | null
  cw_enabled: boolean | null
  is_active: boolean | null
}

export default function SuperAdminClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const { data } = await supabase
        .from('clients')
        .select('id, business_name, email, business_niche, client_type, cw_enabled, is_active')
        .order('business_name')

      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

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
    navigate('/')
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-[#888] mt-1">Gerenciamento de clientes da plataforma</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/clients/new')}
          className="flex items-center gap-2 bg-[#00FF88] hover:bg-[#00cc6e] text-black font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
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
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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

      {/* Table */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111] text-[#888]">
              <th className="text-left px-5 py-3 font-medium">ID</th>
              <th className="text-left px-5 py-3 font-medium">Empresa</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Nicho</th>
              <th className="text-left px-5 py-3 font-medium">Tipo</th>
              <th className="text-center px-5 py-3 font-medium">Chatwoot</th>
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
                      title="Ver Dashboard"
                    >
                      <Eye size={16} />
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
