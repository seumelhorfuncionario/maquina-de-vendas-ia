import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { Campaign, CreativePerformance, TrafficAlert, TrafficComparison } from '../types'

interface TrafficSummary {
  spend: number
  clicks: number
  impressions: number
  linkClicks: number
  cpc: number
  ctr: number
  engagement: number
  videoViews: number
  revenue: number
  leads: number
  messagingReplies: number
}

interface TrafficData {
  campaigns: Campaign[]
  creatives: CreativePerformance[]
  summary: TrafficSummary
  alerts: TrafficAlert[]
  comparison: TrafficComparison[]
  loading: boolean
  error: string | null
}

const emptySummary: TrafficSummary = {
  spend: 0, clicks: 0, impressions: 0, linkClicks: 0, cpc: 0, ctr: 0,
  engagement: 0, videoViews: 0, revenue: 0, leads: 0, messagingReplies: 0,
}

export const useTrafficData = (dateFrom?: string, dateTo?: string) => {
  const { clientId, loading: clientLoading } = useClientId()
  const [data, setData] = useState<TrafficData>({
    campaigns: [], creatives: [], summary: emptySummary,
    alerts: [], comparison: [], loading: true, error: null,
  })

  const fetchData = useCallback(async () => {
    if (!clientId) { setData(prev => ({ ...prev, loading: false })); return }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      const from = dateFrom || (() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] })()
      const to = dateTo || new Date().toISOString().split('T')[0]

      // Tables not yet in auto-generated database.ts — cast needed
      const [{ data: campRows, error: campErr }, { data: crRows, error: crErr }] = await Promise.all([
        (supabase.from as any)('campaigns')
          .select('*')
          .eq('client_id', clientId)
          .gte('date', from)
          .lte('date', to)
          .order('spend', { ascending: false }),
        (supabase.from as any)('creatives_performance')
          .select('*')
          .eq('client_id', clientId)
          .gte('date', from)
          .lte('date', to)
          .order('spend', { ascending: false }),
      ])

      if (campErr) throw campErr
      if (crErr) throw crErr

      // Rows vem com granularidade diaria (uma linha por campaign_id × date). Agregamos
      // por campaign_id pra que `campaigns.length` e groupCampaigns reflitam campanhas reais
      // nao snapshots diarios. Totais sao somados; taxas (cpm/cpc/ctr/roas) recomputadas do
      // agregado pra evitar media de media.
      type Agg = {
        id: string; campaignId: string; campaignName: string; objective: string; status: string
        spend: number; revenue: number; purchases: number; impressions: number; clicks: number
        leads: number; linkClicks: number; videoViews: number; engagement: number
        messagingReplies: number; lastDate: string
      }
      const aggMap = new Map<string, Agg>()
      for (const r of (campRows || []) as any[]) {
        const key = String(r.campaign_id)
        const prev = aggMap.get(key)
        if (!prev) {
          aggMap.set(key, {
            id: r.id, campaignId: key, campaignName: r.campaign_name,
            objective: r.objective, status: r.status,
            spend: Number(r.spend) || 0, revenue: Number(r.revenue) || 0,
            purchases: r.purchases || 0,
            impressions: Number(r.impressions) || 0, clicks: Number(r.clicks) || 0,
            leads: r.leads || 0, linkClicks: r.link_clicks || 0,
            videoViews: r.video_views || 0, engagement: r.engagement || 0,
            messagingReplies: r.messaging_replies || 0, lastDate: String(r.date),
          })
        } else {
          prev.spend += Number(r.spend) || 0
          prev.revenue += Number(r.revenue) || 0
          prev.purchases += r.purchases || 0
          prev.impressions += Number(r.impressions) || 0
          prev.clicks += Number(r.clicks) || 0
          prev.leads += r.leads || 0
          prev.linkClicks += r.link_clicks || 0
          prev.videoViews += r.video_views || 0
          prev.engagement += r.engagement || 0
          prev.messagingReplies += r.messaging_replies || 0
          if (r.date > prev.lastDate) { prev.lastDate = String(r.date); prev.status = r.status }
        }
      }
      const campaigns: Campaign[] = Array.from(aggMap.values()).map(a => {
        const cpm = a.impressions > 0 ? (a.spend / a.impressions) * 1000 : 0
        const cpc = a.clicks > 0 ? a.spend / a.clicks : 0
        const ctr = a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0
        const roas = a.spend > 0 ? a.revenue / a.spend : 0
        const results = a.leads > 0 ? a.leads : (a.purchases > 0 ? a.purchases : a.messagingReplies)
        const costPerResult = results > 0 ? a.spend / results : 0
        return {
          id: a.id, campaignId: a.campaignId, campaignName: a.campaignName,
          objective: a.objective as any, status: a.status as any,
          spend: a.spend, revenue: a.revenue, purchases: a.purchases,
          impressions: a.impressions, clicks: a.clicks, leads: a.leads,
          cpm: +cpm.toFixed(2), cpc: +cpc.toFixed(2), ctr: +ctr.toFixed(2), roas: +roas.toFixed(2),
          linkClicks: a.linkClicks, videoViews: a.videoViews, engagement: a.engagement,
          messagingReplies: a.messagingReplies,
          costPerResult: +costPerResult.toFixed(2),
          date: a.lastDate,
        }
      }).sort((a, b) => b.spend - a.spend)

      const creatives: CreativePerformance[] = (crRows || []).map((r: any) => ({
        id: r.id,
        creativeId: r.creative_id,
        creativeName: r.creative_name,
        campaignId: r.campaign_id,
        adSetName: r.ad_set_name,
        spend: Number(r.spend) || 0,
        revenue: Number(r.revenue) || 0,
        purchases: r.purchases || 0,
        impressions: Number(r.impressions) || 0,
        clicks: Number(r.clicks) || 0,
        roas: Number(r.roas) || 0,
        ctr: Number(r.ctr) || 0,
        cpc: Number(r.cpc) || 0,
        classification: r.classification || 'neutral',
        thumbnailUrl: r.thumbnail_url,
        date: r.date,
      }))

      // Compute summary
      const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
      const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
      const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)

      const summary: TrafficSummary = {
        spend: totalSpend,
        clicks: totalClicks,
        impressions: totalImpressions,
        linkClicks: campaigns.reduce((s, c) => s + c.linkClicks, 0),
        cpc: totalClicks > 0 ? +(totalSpend / totalClicks).toFixed(2) : 0,
        ctr: totalImpressions > 0 ? +((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
        engagement: campaigns.reduce((s, c) => s + c.engagement, 0),
        videoViews: campaigns.reduce((s, c) => s + c.videoViews, 0),
        revenue: campaigns.reduce((s, c) => s + c.revenue, 0),
        leads: campaigns.reduce((s, c) => s + c.leads, 0),
        messagingReplies: campaigns.reduce((s, c) => s + (c.messagingReplies || 0), 0),
      }

      // Generate alerts
      const alerts: TrafficAlert[] = []
      for (const c of campaigns) {
        if (c.ctr < 1 && c.status === 'ACTIVE') {
          alerts.push({
            id: `alert-ctr-${c.id}`, type: 'low_ctr', severity: 'danger',
            title: 'CTR muito baixo',
            description: `"${c.campaignName}" está com CTR de ${c.ctr.toFixed(2)}%. Considere trocar o criativo.`,
            campaignName: c.campaignName, value: c.ctr,
          })
        }
        if (c.cpc > 3 && c.status === 'ACTIVE') {
          alerts.push({
            id: `alert-cpc-${c.id}`, type: 'high_cpc', severity: 'warning',
            title: 'CPC elevado',
            description: `"${c.campaignName}" está com CPC de R$ ${c.cpc.toFixed(2)}, acima da média.`,
            campaignName: c.campaignName, value: c.cpc,
          })
        }
      }
      for (const cr of creatives) {
        if (cr.classification === 'fatigue') {
          alerts.push({
            id: `alert-fatigue-${cr.id}`, type: 'fatigue', severity: 'warning',
            title: 'Fadiga de criativo',
            description: `"${cr.creativeName}" mostra sinais de fadiga com ROAS de ${cr.roas.toFixed(1)}x.`,
            value: cr.roas,
          })
        }
      }

      setData({
        campaigns, creatives, summary, alerts,
        comparison: [], // populated from daily data when available
        loading: false, error: null,
      })
    } catch (err) {
      console.error('Error fetching traffic data:', err)
      setData(prev => ({
        ...prev, loading: false,
        error: err instanceof Error ? err.message : 'Erro ao buscar dados de tráfego',
      }))
    }
  }, [clientId, dateFrom, dateTo])

  useEffect(() => {
    if (!clientLoading && clientId) fetchData()
    else if (!clientLoading) setData(prev => ({ ...prev, loading: false }))
  }, [clientId, clientLoading, fetchData])

  return { ...data, refetch: fetchData }
}
