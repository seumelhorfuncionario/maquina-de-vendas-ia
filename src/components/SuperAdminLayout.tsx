import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Users, Puzzle, LogOut } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/super-admin', label: 'Clientes', icon: Users, end: true },
  { to: '/super-admin/features', label: 'Features', icon: Puzzle, end: false },
]

export default function SuperAdminLayout() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">
          {/* Logo + Badge -- colapsa texto em mobile pra priorizar nav */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img src="/brand/logo-smf.webp" alt="SMF" className="w-8 h-8 rounded-lg" />
            <span className="hidden md:inline text-lg font-bold text-white tracking-tight">
              Sala do Chefe
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#00D4FF20] text-[#00D4FF] text-[10px] font-bold uppercase tracking-widest border border-[#00D4FF30]">
              Admin
            </span>
          </div>

          {/* Nav Links -- centrais, flex-1 pra ocupar espaco e empurrar acoes pra direita */}
          <nav className="flex items-center gap-1 flex-1 justify-center sm:justify-start sm:ml-4">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF30]'
                      : 'text-[#888] hover:text-white hover:bg-[#111]'
                  }`
                }
                title={label}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User + Logout -- email so desktop, logout icone-only em mobile */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="hidden lg:inline text-xs text-[#888] truncate max-w-[200px]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg text-sm text-[#888] hover:text-red-400 hover:bg-[#111] transition-colors"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
