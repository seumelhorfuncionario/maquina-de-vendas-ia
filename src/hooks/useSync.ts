import { useState, useCallback } from 'react'
import { useClientId } from './useClientId'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

interface SyncResult {
  ok: boolean
  totalItems?: number
  chatsUpdated?: number
  salesCreated?: number
  productsCreated?: number
  error?: string
}

export const useSync = () => {
  const { clientId } = useClientId()
  const [syncing, setSyncing] = useState(false)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)

  const sync = useCallback(async () => {
    if (!clientId || !SUPABASE_URL || syncing) return null
    setSyncing(true)
    setLastResult(null)

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/kanban-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })
      const data: SyncResult = await res.json()
      setLastResult(data)
      return data
    } catch (err) {
      const result = { ok: false, error: String(err) }
      setLastResult(result)
      return result
    } finally {
      setSyncing(false)
    }
  }, [clientId, syncing])

  return { sync, syncing, lastResult }
}
