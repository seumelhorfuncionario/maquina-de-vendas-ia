import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './AuthContext'

export interface FunnelStage {
  id: string
  client_id: string
  stage_name: string
  stage_order: number
  is_qualified: boolean | null
  is_conversion: boolean | null
  color: string | null
}

export interface TenantFeature {
  feature_key: string
  feature_name: string
  category: string | null
  is_enabled: boolean
}

interface TenantContextType {
  features: TenantFeature[]
  funnelStages: FunnelStage[]
  loading: boolean
  hasFeature: (key: string) => boolean
}

const TenantContext = createContext<TenantContextType | null>(null)

export function TenantProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isDemo, isSuperAdmin, clientProfile } = useAuth()
  const [features, setFeatures] = useState<TenantFeature[]>([])
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)

  // Resolve o clientId: super admin pode selecionar via localStorage
  const resolvedClientId = clientProfile?.id || (isSuperAdmin ? localStorage.getItem('selectedClientId') : null)

  useEffect(() => {
    if (!isAuthenticated) {
      setFeatures([])
      setFunnelStages([])
      setLoading(false)
      return
    }

    if (isDemo) {
      loadDemoTenantData()
    } else if (resolvedClientId) {
      loadRealTenantData(resolvedClientId)
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, isDemo, resolvedClientId])

  const loadDemoTenantData = () => {
    setFeatures([
      { feature_key: 'dashboard', feature_name: 'Dashboard', category: 'analytics', is_enabled: true },
      { feature_key: 'leads_crm', feature_name: 'Leads CRM', category: 'management', is_enabled: true },
      { feature_key: 'sales', feature_name: 'Vendas', category: 'management', is_enabled: true },
      { feature_key: 'production', feature_name: 'Produção', category: 'management', is_enabled: true },
      { feature_key: 'financial', feature_name: 'Financeiro', category: 'analytics', is_enabled: true },
      { feature_key: 'products', feature_name: 'Produtos', category: 'management', is_enabled: true },
      { feature_key: 'ia_vision', feature_name: 'Visão IA', category: 'ai', is_enabled: true },
      { feature_key: 'traffic_dashboard', feature_name: 'Dashboard de Tráfego', category: 'analytics', is_enabled: true },
      { feature_key: 'creatives_calendar', feature_name: 'Calendário de Criativos', category: 'content', is_enabled: true },
    ])
    setFunnelStages([
      { id: '1', client_id: 'demo', stage_name: 'Novo Lead', stage_order: 1, is_qualified: false, is_conversion: false, color: '#6366f1' },
      { id: '2', client_id: 'demo', stage_name: 'Qualificando', stage_order: 2, is_qualified: false, is_conversion: false, color: '#8b5cf6' },
      { id: '3', client_id: 'demo', stage_name: 'Orçamento Enviado', stage_order: 3, is_qualified: true, is_conversion: false, color: '#ec4899' },
      { id: '4', client_id: 'demo', stage_name: 'Negociando', stage_order: 4, is_qualified: true, is_conversion: false, color: '#10b981' },
      { id: '5', client_id: 'demo', stage_name: 'Venda Fechada', stage_order: 5, is_qualified: true, is_conversion: true, color: '#22c55e' },
      { id: '6', client_id: 'demo', stage_name: 'Perdido', stage_order: 6, is_qualified: false, is_conversion: false, color: '#FF4D6A' },
    ])
    setLoading(false)
  }

  const loadRealTenantData = async (clientId: string) => {
    try {
      setLoading(true)

      const [featuresResult, stagesResult] = await Promise.all([
        supabase
          .from('client_features_view' as any)
          .select('*')
          .eq('client_id', clientId),
        supabase
          .from('funnel_stages')
          .select('*')
          .eq('client_id', clientId)
          .order('stage_order', { ascending: true }),
      ])

      if (featuresResult.data) {
        setFeatures(featuresResult.data as any)
      }

      if (stagesResult.data) {
        setFunnelStages(stagesResult.data.map(s => ({ ...s, color: null })) as FunnelStage[])
      }
    } catch (error) {
      console.error('Error loading tenant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasFeature = (key: string): boolean => {
    if (isDemo || isSuperAdmin) return true
    const feature = features.find(f => f.feature_key === key)
    return feature?.is_enabled ?? false
  }

  return (
    <TenantContext.Provider value={{ features, funnelStages, loading, hasFeature }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
