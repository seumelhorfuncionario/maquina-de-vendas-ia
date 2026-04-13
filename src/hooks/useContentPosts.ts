import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { ContentPost, ContentStatus } from '../types'

interface ContentPostsData {
  posts: ContentPost[]
  loading: boolean
  error: string | null
}

export const useContentPosts = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [data, setData] = useState<ContentPostsData>({
    posts: [], loading: true, error: null,
  })

  const fetchPosts = useCallback(async () => {
    if (!clientId) { setData(prev => ({ ...prev, loading: false })); return }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Table not yet in auto-generated database.ts — cast needed
      const { data: rows, error } = await (supabase.from as any)('content_posts')
        .select('*')
        .eq('client_id', clientId)
        .order('scheduled_date', { ascending: true })

      if (error) throw error

      const posts: ContentPost[] = (rows || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        contentType: r.content_type,
        caption: r.caption,
        mediaUrl: r.media_url,
        thumbnailUrl: r.thumbnail_url,
        platform: r.platform,
        status: r.status,
        scheduledDate: r.scheduled_date,
        publishedAt: r.published_at,
        approvedAt: r.approved_at,
        notes: r.notes,
        tags: r.tags,
        createdAt: r.created_at,
      }))

      setData({ posts, loading: false, error: null })
    } catch (err) {
      console.error('Error fetching content posts:', err)
      setData(prev => ({
        ...prev, loading: false,
        error: err instanceof Error ? err.message : 'Erro ao buscar posts',
      }))
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading && clientId) fetchPosts()
    else if (!clientLoading) setData(prev => ({ ...prev, loading: false }))
  }, [clientId, clientLoading, fetchPosts])

  const updatePostStatus = async (postId: string, newStatus: ContentStatus, notes?: string) => {
    const updates: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'approved') {
      updates.approved_at = new Date().toISOString()
    } else if (newStatus === 'published') {
      updates.published_at = new Date().toISOString()
    }

    if (notes !== undefined) {
      updates.notes = notes
    }

    const { error } = await (supabase.from as any)('content_posts')
      .update(updates)
      .eq('id', postId)

    if (error) {
      console.error('Error updating post status:', error)
      return
    }

    fetchPosts()
  }

  return { ...data, updatePostStatus, refetch: fetchPosts }
}
