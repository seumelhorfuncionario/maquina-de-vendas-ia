import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { Lead, LeadStatus } from '../types'

// Mapeia etapa_fu do Chatwoot/chats para os status do frontend
const STAGE_MAP: Record<string, LeadStatus> = {
  'Novos Leads': 'new',
  'novo': 'new',
  'Em Atendimento': 'attending',
  'atendimento': 'attending',
  'Proposta Enviada': 'proposal',
  'proposta': 'proposal',
  'Venda Fechada': 'sold',
  'venda': 'sold',
  'ganho': 'sold',
  'Perdido': 'lost',
  'perdido': 'lost',
}

function mapStageToStatus(stage: string | null): LeadStatus {
  if (!stage) return 'new'
  return STAGE_MAP[stage] || 'new'
}

export const useLeads = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const mappedLeads: Lead[] = (data || []).map(chat => ({
        id: String(chat.id),
        name: chat.nome || 'Sem nome',
        phone: chat.phone || '',
        product: chat.tags || '',
        origin: chat.Agente || 'WhatsApp',
        status: mapStageToStatus(chat.etapa_fu),
        createdAt: chat.created_at ? chat.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        value: undefined,
      }))

      setLeads(mappedLeads)
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar leads')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading && clientId) {
      fetchLeads()
    } else if (!clientLoading) {
      setLoading(false)
    }
  }, [clientId, clientLoading, fetchLeads])

  const moveLeadStatus = async (id: string, newStatus: LeadStatus) => {
    // Atualiza otimisticamente no frontend
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))

    // Mapeia status de volta para etapa_fu do banco
    const STATUS_TO_STAGE: Record<LeadStatus, string> = {
      new: 'Novos Leads',
      attending: 'Em Atendimento',
      proposal: 'Proposta Enviada',
      sold: 'Venda Fechada',
      lost: 'Perdido',
    }

    try {
      const { error } = await supabase
        .from('chats')
        .update({ etapa_fu: STATUS_TO_STAGE[newStatus] })
        .eq('id', Number(id))

      if (error) {
        console.error('Error updating lead status:', error)
        // Reverte em caso de erro
        fetchLeads()
      }
    } catch (err) {
      console.error('Error moving lead:', err)
      fetchLeads()
    }
  }

  return { leads, loading, error, moveLeadStatus, refetch: fetchLeads }
}
