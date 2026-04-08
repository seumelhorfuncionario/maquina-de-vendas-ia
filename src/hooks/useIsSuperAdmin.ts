import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useIsSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSuperAdmin()
  }, [])

  const checkSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        const { data } = await supabase
          .from('super_admins')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()

        setIsSuperAdmin(!!data)
      } else {
        setIsSuperAdmin(false)
      }
    } catch (error) {
      console.error('Error checking super admin status:', error)
      setIsSuperAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return { isSuperAdmin, loading }
}
