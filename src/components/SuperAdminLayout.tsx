import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Puzzle, LogOut } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/super-admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/super-admin/clients', label: 'Clientes', icon: Users, end: false },
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo + Badge */}
          <div className="flex items-center gap-3">
            <img src="/brand/logo-smf.png" alt="SMF Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-white tracking-tight">
              Máquina de Vendas IA
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#00D4FF20] text-[#00D4FF] text-[10px] font-bold uppercase tracking-widest border border-[#00D4FF30]">
              Admin
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#00D4FF15] text-[#00D4FF] border border-[#00D4FF30]'
                      : 'text-[#888] hover:text-white hover:bg-[#111]'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#888]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#888] hover:text-red-400 hover:bg-[#111] transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
