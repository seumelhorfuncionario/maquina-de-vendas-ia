import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
  BarChart3,
  CalendarCheck,
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
  Cpu,
  LifeBuoy,
  ExternalLink,
  Bell,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import NotificationPreferences from './NotificationPreferences'

// Ordem canonica. Cada item e filtrado por hasFeature() — pra clientes que nao
// usam, basta desativar a feature em client_features (ex: Levani/Bumbum tem
// agendamento, so precisam de Agendamentos/Relatorios; Arte Nossa e
// product_sales, precisa de Leads/Vendas/Financeiro).
const allNavItems = [
  { to: '/', icon: CalendarCheck, label: 'Agendamentos', feature: 'dashboard' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios', feature: 'dashboard' },
  { to: '/leads', icon: Users, label: 'Leads (CRM)', feature: 'leads_crm' },
  { to: '/vendas', icon: ShoppingCart, label: 'Vendas', feature: 'sales' },
  { to: '/producao', icon: Factory, label: 'Produção', feature: 'production' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', feature: 'financial' },
  { to: '/produtos', icon: Package, label: 'Produtos', feature: 'products' },
  { to: '/ia', icon: Bot, label: 'Converse com sua IA', feature: 'ia_vision' },
  { to: '/trafego', icon: Megaphone, label: 'Tráfego', feature: 'traffic_dashboard' },
  { to: '/criativos', icon: Palette, label: 'Criativos', feature: 'creatives_calendar' },
]

const supportNavItems = [
  { to: '/gestao-ia', icon: Cpu, label: 'Gestão da IA' },
  { to: '/meus-tickets', icon: LifeBuoy, label: 'Meus Tickets' },
]

const externalNavItems: { href: string; icon: typeof Cpu; label: string }[] = []

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const { hasFeature } = useTenant()
  const { theme, toggleTheme } = useTheme()
  const [showNotifModal, setShowNotifModal] = useState(false)

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
            <h1 className="text-sm font-bold text-theme-primary leading-tight">Motor de Vendas</h1>
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

        <div className="pt-4 mt-4 border-t border-theme">
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-theme-muted">
              Suporte
            </div>
          )}
          {supportNavItems.map(item => (
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
          {externalNavItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-theme-secondary hover:text-theme-primary group"
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* Modal de Notificações */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4" onClick={() => setShowNotifModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl border border-theme shadow-2xl z-10"
            style={{ backgroundColor: 'var(--bg-base)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
              <h2 className="text-sm font-semibold text-theme-primary">Notificações Push</h2>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <NotificationPreferences />
            </div>
          </div>
        </div>
      )}

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

        {/* Notification settings */}
        <button
          onClick={() => setShowNotifModal(true)}
          aria-label="Configurar notificações"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-theme-secondary hover:text-theme-primary hover:surface-elevated transition-all w-full cursor-pointer mb-2"
        >
          <Bell size={18} className="shrink-0" />
          {!collapsed && <span>Notificações</span>}
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
