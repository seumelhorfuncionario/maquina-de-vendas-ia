import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import { useCallback, useEffect, useState } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export const useKanbanSync = () => {
  const { clientId } = useClientId()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!clientId) return
    supabase
      .from('clients')
      .select('cw_enabled, cw_api_token, cw_account_id')
      .eq('id', clientId)
      .single()
      .then(({ data }) => {
        setIsConnected(!!(data?.cw_enabled && data.cw_api_token && data.cw_account_id))
      })
  }, [clientId])

  const syncMoveToStage = useCallback(async (kanbanItemId: string, newStageName: string) => {
    if (!clientId || !kanbanItemId || !SUPABASE_URL) return

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/kanban-move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, kanbanItemId, newStageName }),
        }
      )

      if (!response.ok) {
        const text = await response.text()
        console.error('Kanban sync failed:', text)
      }
    } catch (err) {
      console.error('Kanban sync error:', err)
    }
  }, [clientId])

  return { syncMoveToStage, isConnected }
}
