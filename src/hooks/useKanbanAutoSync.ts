import { useEffect, useState, useCallback, useRef } from 'react'
import { useClientId } from './useClientId'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Faz sync automático com o kanban externo toda vez que o componente monta (F5/navegação).
 * Retorna `synced: true` quando o sync terminou (ou falhou) — só então os dados devem ser buscados.
 * Timeout de 8s para não travar a UI caso a Edge Function demore.
 */
export function useKanbanAutoSync() {
  const { clientId, loading: clientLoading } = useClientId()
  const [synced, setSynced] = useState(false)
  const didSync = useRef(false)

  const triggerSync = useCallback(async () => {
    if (!clientId || !SUPABASE_URL) {
      setSynced(true)
      return
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      await fetch(`${SUPABASE_URL}/functions/v1/kanban-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
        signal: controller.signal,
      })

      clearTimeout(timeout)
    } catch (err) {
      // Timeout ou erro de rede — não bloqueia, segue com dados do banco
      console.warn('Kanban auto-sync falhou (dados locais serão usados):', err)
    } finally {
      setSynced(true)
    }
  }, [clientId])

  useEffect(() => {
    if (clientLoading || didSync.current) return
    if (clientId) {
      didSync.current = true
      triggerSync()
    } else {
      setSynced(true)
    }
  }, [clientId, clientLoading, triggerSync])

  return { synced }
}
