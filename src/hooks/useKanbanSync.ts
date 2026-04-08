import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import { useCallback, useEffect, useState } from 'react'

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
    if (!clientId || !kanbanItemId) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kanban-move`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ clientId, kanbanItemId, newStageName }),
        }
      )

      if (!response.ok) {
        console.error('Kanban sync failed:', await response.text())
      }
    } catch (err) {
      console.error('Kanban sync error:', err)
    }
  }, [clientId])

  return { syncMoveToStage, isConnected }
}
