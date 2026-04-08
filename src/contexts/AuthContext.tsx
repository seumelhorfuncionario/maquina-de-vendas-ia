import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client'
import type { User } from '../types'
import { mockUser } from '../data/mock'

const DEMO_EMAIL = 'carlos@quadrosart.com.br'
const DEMO_PASSWORD = 'demo123'

interface ClientProfile {
  id: string
  business_name: string
  business_niche: string | null
  client_type: string | null
  cw_enabled: boolean | null
}

interface AuthContextType {
  user: User | null
  clientProfile: ClientProfile | null
  isAuthenticated: boolean
  isDemo: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkExistingSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setClientProfile(null)
          setIsDemo(false)
        } else if (session?.user && !isDemo) {
          await loadUserProfile(session.user.id, session.user.email || '')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkExistingSession = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email || '')
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (authUserId: string, email: string) => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('id, business_name, business_niche, cw_enabled')
        .eq('auth_user_id', authUserId)
        .eq('is_active', true)
        .single()

      if (client) {
        setUser({
          id: client.id,
          name: client.business_name,
          email: email,
          company: client.business_name,
        })
        setClientProfile({
          id: client.id,
          business_name: client.business_name,
          business_niche: client.business_niche,
          client_type: null,
          cw_enabled: client.cw_enabled,
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Demo mode
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setUser(mockUser)
      setIsDemo(true)
      setClientProfile(null)
      return { success: true }
    }

    // Real Supabase Auth
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Sistema em modo demo. Use as credenciais de demonstracao.' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await loadUserProfile(data.user.id, data.user.email || email)

        // Se nao achou client, pode ser super admin - verifica
        if (!user) {
          const { data: superAdmin } = await supabase
            .from('super_admins')
            .select('id, name')
            .eq('email', data.user.email!)
            .maybeSingle()

          if (superAdmin) {
            setUser({
              id: superAdmin.id,
              name: superAdmin.name || 'Admin',
              email: data.user.email || email,
              company: 'Maquina de Vendas IA',
            })
          } else {
            setUser({
              id: data.user.id,
              name: data.user.email || email,
              email: data.user.email || email,
              company: '',
            })
          }
        }
        return { success: true }
      }

      return { success: false, error: 'Erro ao fazer login' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado',
      }
    }
  }

  const logout = async () => {
    if (!isDemo && isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setClientProfile(null)
    setIsDemo(false)
    localStorage.removeItem('selectedClientId')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        clientProfile,
        isAuthenticated: !!user,
        isDemo,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
