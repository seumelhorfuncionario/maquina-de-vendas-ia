import { useAuth } from '@/contexts/AuthContext'

// Deriva do AuthContext em vez de fazer chamada propria a supabase.auth.getUser().
// Antes, supabase.auth.getUser() competia pelo mesmo auth lock que o AuthContext
// usa em checkExistingSession. Quando o lock estava ocupado, essa call ficava
// na fila sem nunca emitir request HTTP -- o gate /super-admin/* travava em
// "Verificando permissoes..." indefinidamente sem nada aparecer no network/console.
// AuthContext.loadFullProfile ja valida super_admins; aqui so consumimos.
export function useIsSuperAdmin() {
  const { isSuperAdmin, loading } = useAuth()
  return { isSuperAdmin, loading }
}
