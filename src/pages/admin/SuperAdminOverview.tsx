import { useEffect, useState } from 'react'
import { Users, Puzzle, BarChart3, AlertTriangle, Loader2 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { supabase } from '@/integrations/supabase/client'

interface ClientRow {
  id: string
  business_name: string
  email: string
  is_active: boolean | null
}

export default function SuperAdminOverview() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [totalFeatures, setTotalFeatures] = useState(0)
  const [avgCoverage, setAvgCoverage] = useState(0)
  const [clientsWithZero, setClientsWithZero] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, business_name, email, is_active')
        .order('business_name')

      // Fetch features count
      const { count: featuresCount } = await supabase
        .from('features')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)

      // Fetch client_features
      const { data: cfData } = await supabase
        .from('client_features')
        .select('client_id, is_enabled')

      const allClients = clientsData || []
      const activeClients = allClients.filter(c => c.is_active !== false)
      const totalFeat = featuresCount || 0

      // Calculate coverage per client
      let totalCoverage = 0
      let zeroCount = 0

      for (const client of activeClients) {
        const enabledCount = (cfData || []).filter(
          cf => cf.client_id === client.id && cf.is_enabled
        ).length

        if (enabledCount === 0) zeroCount++
        if (totalFeat > 0) {
          totalCoverage += (enabledCount / totalFeat) * 100
        }
      }

      const avg = activeClients.length > 0 ? totalCoverage / activeClients.length : 0

      setClients(allClients)
      setTotalFeatures(totalFeat)
      setAvgCoverage(Math.round(avg))
      setClientsWithZero(zeroCount)
    } catch (error) {
      console.error('Error loading overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeCount = clients.filter(c => c.is_active !== false).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
        <span className="ml-3 text-sm text-neutral-500">Carregando dados...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Painel Super Admin</h1>
        <p className="text-sm text-[#888] mt-1">Visão geral de todos os clientes e features</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          title="Cobertura Media"
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

      {/* Clients List */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h2 className="text-base font-semibold text-white">Todos os Clientes</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111] text-[#888]">
              <th className="text-left px-5 py-3 font-medium">Empresa</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-center px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr
                key={client.id}
                className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors"
              >
                <td className="px-5 py-3 text-white font-medium">{client.business_name}</td>
                <td className="px-5 py-3 text-[#888]">{client.email}</td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      client.is_active !== false
                        ? 'bg-[#00FF8818] text-[#00FF88] border border-[#00FF8830]'
                        : 'bg-[#FF4D6A18] text-[#FF4D6A] border border-[#FF4D6A30]'
                    }`}
                  >
                    {client.is_active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-[#888]">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
