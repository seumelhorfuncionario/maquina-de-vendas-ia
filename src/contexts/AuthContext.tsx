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
  isSuperAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirect?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  useEffect(() => {
    // Fonte UNICA de session state: onAuthStateChange. Supabase dispara
    // INITIAL_SESSION na primeira montagem (com session do storage ou null) e depois
    // SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED. Antes, chamavamos checkExistingSession()
    // em paralelo que fazia o MESMO getSession -- as duas competiam pelo auth lock
    // e o segundo esperava 5s, gerando "Carregando..." eterno em aba anonima (INITIAL_SESSION
    // chegava mas checkExistingSession ficava pendurado, setLoading(false) nunca rodava
    // se hosting do finally entrava num loop de espera).
    if (!isSupabaseConfigured()) {
      setLoading(false)
      setInitialCheckDone(true)
      return
    }

    // Safety net: se por qualquer motivo INITIAL_SESSION nao chegar em 5s (Supabase
    // bug, rede, lock corrompido), forca loading=false pra usuario nao ficar preso.
    const safetyTimeout = setTimeout(() => {
      setLoading(false)
      setInitialCheckDone(true)
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(safetyTimeout)

        if (event === 'SIGNED_OUT') {
          setUser(null)
          setClientProfile(null)
          setIsDemo(false)
          setIsSuperAdmin(false)
          setLoading(false)
          setInitialCheckDone(true)
          return
        }

        // INITIAL_SESSION (startup), SIGNED_IN (login/verifyOtp), TOKEN_REFRESHED, USER_UPDATED
        if (session?.user) {
          try {
            await loadFullProfile(session.user.id, session.user.email || '')
          } catch (err) {
            console.error('Error loading profile:', err)
          }
        }
        setLoading(false)
        setInitialCheckDone(true)
      }
    )

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const loadFullProfile = async (authUserId: string, email: string) => {
    // 1. Checar se e super admin
    const { data: superAdmin } = await supabase
      .from('super_admins')
      .select('id, name')
      .eq('email', email)
      .maybeSingle()

    if (superAdmin) {
      setIsSuperAdmin(true)
      setUser({
        id: superAdmin.id,
        name: superAdmin.name || 'Admin',
        email: email,
        company: 'Sala do Chefe',
      })
    }

    // 2. Checar se tem client vinculado
    const { data: client } = await supabase
      .from('clients')
      .select('id, business_name, business_niche, cw_enabled, client_type')
      .eq('auth_user_id', authUserId)
      .eq('is_active', true)
      .maybeSingle()

    if (client) {
      if (!superAdmin) {
        setUser({
          id: client.id,
          name: client.business_name,
          email: email,
          company: client.business_name,
        })
      }
      setClientProfile({
        id: client.id,
        business_name: client.business_name,
        business_niche: client.business_niche,
        client_type: client.client_type,
        cw_enabled: client.cw_enabled,
      })
    }

    // 3. Se nao e nenhum dos dois, seta user basico
    if (!superAdmin && !client) {
      setUser({
        id: authUserId,
        name: email,
        email: email,
        company: '',
      })
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; redirect?: string }> => {
    // Demo mode
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setUser(mockUser)
      setIsDemo(true)
      setClientProfile(null)
      return { success: true, redirect: '/' }
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
        await loadFullProfile(data.user.id, data.user.email || email)

        // Checar se e super admin pra redirecionar
        const { data: saCheck } = await supabase
          .from('super_admins')
          .select('id')
          .eq('email', data.user.email!)
          .maybeSingle()

        if (saCheck) {
          return { success: true, redirect: '/super-admin' }
        }

        return { success: true, redirect: '/' }
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
    setIsSuperAdmin(false)
    localStorage.removeItem('selectedClientId')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        clientProfile,
        isAuthenticated: !!user,
        isDemo,
        isSuperAdmin,
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
