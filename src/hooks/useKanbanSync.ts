import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import { useCallback, useEffect, useState } from 'react'

// Mapeia stage_name do dashboard → stage key do Kanban StackLab
const STAGE_NAME_TO_KEY: Record<string, string> = {
  'Novo Lead': 'prospeccao',
  'Qualificando': 'qualificacao',
  'Orçamento Enviado': 'proposta',
  'Negociando': 'fechamento',
  'Venda Fechada': 'venda_fechada',
  'Em Produção': 'em_produ_o',
  'Entregue': 'entregue',
}

interface CwCredentials {
  baseUrl: string
  token: string
  accountId: string
}

export const useKanbanSync = () => {
  const { clientId } = useClientId()
  const [credentials, setCredentials] = useState<CwCredentials | null>(null)

  useEffect(() => {
    if (!clientId) return
    supabase
      .from('clients')
      .select('cw_base_url, cw_api_token, cw_account_id, cw_enabled')
      .eq('id', clientId)
      .single()
      .then(({ data }) => {
        if (data?.cw_enabled && data.cw_base_url && data.cw_api_token && data.cw_account_id) {
          setCredentials({
            baseUrl: data.cw_base_url,
            token: data.cw_api_token,
            accountId: data.cw_account_id,
          })
        }
      })
  }, [clientId])

  const syncMoveToStage = useCallback(async (kanbanItemId: string, newStageName: string) => {
    if (!credentials || !kanbanItemId) return

    const stageKey = STAGE_NAME_TO_KEY[newStageName]
    if (!stageKey) {
      console.warn(`No kanban stage key for: ${newStageName}`)
      return
    }

    try {
      const response = await fetch(
        `${credentials.baseUrl}/api/v1/accounts/${credentials.accountId}/kanban_items/${kanbanItemId}/move_to_stage?funnel_stage=${stageKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': credentials.token,
          },
        }
      )

      if (!response.ok) {
        console.error('Kanban sync failed:', await response.text())
      }
    } catch (err) {
      console.error('Kanban sync error:', err)
    }
  }, [credentials])

  return { syncMoveToStage, isConnected: !!credentials }
}
