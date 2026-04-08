import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Factory,
  DollarSign,
  Package,
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useMemo } from 'react'

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', feature: 'dashboard' },
  { to: '/leads', icon: Users, label: 'Leads (CRM)', feature: 'leads_crm' },
  { to: '/vendas', icon: ShoppingCart, label: 'Vendas', feature: 'sales' },
  { to: '/producao', icon: Factory, label: 'Produção', feature: 'production' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', feature: 'financial' },
  { to: '/produtos', icon: Package, label: 'Produtos', feature: 'products' },
  { to: '/ia', icon: Bot, label: 'Visão da IA', feature: 'ia_vision' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const { hasFeature } = useTenant()

  const navItems = useMemo(
    () => allNavItems.filter(item => hasFeature(item.feature)),
    [hasFeature]
  )

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col z-50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      <div className="p-5 border-b border-[#1a1a1a] flex items-center gap-3">
        <img src="/brand/logo-smf.webp" alt="SMF Logo" className="w-9 h-9 rounded-lg shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white leading-tight">Maquina de Vendas</h1>
            <span className="text-[10px] text-[#00D4FF] font-semibold tracking-widest uppercase">IA</span>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          className="ml-auto p-1 rounded hover:bg-[#1a1a1a] text-[#888] hover:text-white transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#00D4FF15] text-[#00D4FF] shadow-[inset_0_0_0_1px_#00D4FF30]'
                  : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1a1a1a]">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-[#555] truncate">{user.company}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888] hover:text-[#FF4D6A] hover:bg-[#FF4D6A15] transition-all w-full"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}
