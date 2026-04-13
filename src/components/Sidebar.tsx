import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Factory,
  DollarSign,
  Package,
  Bot,
  Megaphone,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
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
  { to: '/trafego', icon: Megaphone, label: 'Tráfego', feature: 'traffic_dashboard' },
  { to: '/criativos', icon: Palette, label: 'Criativos', feature: 'creatives_calendar' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const { hasFeature } = useTenant()
  const { theme, toggleTheme } = useTheme()

  const navItems = useMemo(
    () => allNavItems.filter(item => hasFeature(item.feature)),
    [hasFeature]
  )

  return (
    <aside className={`fixed top-0 left-0 h-screen surface-card border-r border-theme flex flex-col z-50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      <div className="p-5 border-b border-theme flex items-center gap-3">
        <img src="/brand/logo-smf.webp" alt="SMF Logo" className="w-9 h-9 rounded-lg shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-theme-primary leading-tight">Maquina de Vendas</h1>
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-cyan)' }}>IA</span>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          className="ml-auto p-1 rounded hover:surface-elevated text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
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
                  ? 'text-[var(--accent-cyan)]'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`
            }
            style={({ isActive }) => isActive ? {
              backgroundColor: `color-mix(in srgb, var(--accent-cyan) 10%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--accent-cyan) 20%, transparent)`,
            } : undefined}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-theme">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-theme-secondary hover:text-theme-primary hover:surface-elevated transition-all w-full cursor-pointer mb-2"
        >
          {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>}
        </button>

        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-xs font-semibold text-theme-primary truncate">{user.name}</p>
            <p className="text-[10px] text-theme-muted truncate">{user.company}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-theme-secondary hover:text-[var(--accent-red)] transition-all w-full cursor-pointer"
          style={{ '--hover-bg': 'color-mix(in srgb, var(--accent-red) 10%, transparent)' } as React.CSSProperties}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}
