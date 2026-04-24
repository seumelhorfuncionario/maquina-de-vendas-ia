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
  Sun,
  Moon,
  Cpu,
  LifeBuoy,
  Bell,
  X,
  Menu,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import NotificationPreferences from './NotificationPreferences'
import Tooltip from './Tooltip'

// Ordem canonica. Cada item e filtrado por hasFeature() — pra clientes que nao
// usam, basta desativar a feature em client_features.
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

// alwaysShowLabel=true: nunca vira so icone, mesmo em zoom alto. Usado em Gestao da IA
// porque e o atalho primario pro operador de IA e o icone (Cpu) e generico demais.
const supportNavItems: { to: string; icon: any; label: string; alwaysShowLabel?: boolean }[] = [
  { to: '/gestao-ia', icon: Cpu, label: 'Gestão da IA', alwaysShowLabel: true },
  { to: '/meus-tickets', icon: LifeBuoy, label: 'Meus Tickets' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
    isActive
      ? 'text-[var(--accent-cyan)]'
      : 'text-theme-secondary hover:text-theme-primary'
  }`

const linkStyle = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? {
        backgroundColor: `color-mix(in srgb, var(--accent-cyan) 10%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--accent-cyan) 20%, transparent)`,
      }
    : undefined

export default function TopNav() {
  const { user, logout } = useAuth()
  const { hasFeature } = useTenant()
  const { theme, toggleTheme } = useTheme()
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = useMemo(
    () => allNavItems.filter(item => hasFeature(item.feature)),
    [hasFeature]
  )

  // Fecha menu mobile ao redimensionar pra desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const allItems = [...navItems, ...supportNavItems.map(i => ({ ...i, feature: '__support__' }))]

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-theme backdrop-blur-md"
        style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 85%, transparent)' }}
      >
        <div className="flex items-center gap-4 px-4 sm:px-6 h-14">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/brand/logo-smf.webp" alt="SMF Logo" className="w-8 h-8 rounded-lg" />
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-bold text-theme-primary">Sala do Chefe</div>
            </div>
          </NavLink>

          {/* Divisor */}
          <div className="hidden lg:block w-px h-7 bg-[var(--border)]" />

          {/* Nav items (desktop) */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-thin">
            {navItems.map(item => (
              <Tooltip key={item.to} content={item.label} position="bottom">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={linkClass}
                  style={linkStyle}
                  aria-label={item.label}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                </NavLink>
              </Tooltip>
            ))}

            {/* Separador suporte */}
            <div className="mx-1.5 w-px h-6 bg-[var(--border)]" />

            {supportNavItems.map(item => (
              <Tooltip key={item.to} content={item.label} position="bottom">
                <NavLink
                  to={item.to}
                  className={linkClass}
                  style={linkStyle}
                  aria-label={item.label}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className={item.alwaysShowLabel ? 'inline' : 'hidden xl:inline'}>{item.label}</span>
                </NavLink>
              </Tooltip>
            ))}
          </nav>

          {/* Spacer pra empurrar acoes pra direita em telas < lg */}
          <div className="flex-1 lg:hidden" />

          {/* Acoes a direita */}
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip content={theme === 'dark' ? 'Tema claro' : 'Tema escuro'} position="bottom">
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
                className="p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:surface-elevated transition-all cursor-pointer"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </Tooltip>

            <Tooltip content="Notificações" position="bottom">
              <button
                onClick={() => setShowNotifModal(true)}
                aria-label="Configurar notificações"
                className="p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:surface-elevated transition-all cursor-pointer"
              >
                <Bell size={16} />
              </button>
            </Tooltip>

            {/* User pill + logout (desktop) */}
            {user && (
              <div className="hidden md:flex items-center gap-2 ml-1 pl-3 border-l border-theme">
                <div className="text-right leading-tight max-w-[160px]">
                  <div className="text-xs font-semibold text-theme-primary truncate">{user.name}</div>
                  <div className="text-[10px] text-theme-muted truncate">{user.company}</div>
                </div>
                <Tooltip content="Sair" position="bottom">
                  <button
                    onClick={logout}
                    aria-label="Sair"
                    className="p-2 rounded-lg text-theme-secondary hover:text-[var(--accent-red)] transition-all cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </Tooltip>
              </div>
            )}

            {/* Logout isolado em telas medias (md: nao mostra, < md: mostra so icone) */}
            {user && (
              <Tooltip content="Sair" position="bottom">
                <button
                  onClick={logout}
                  aria-label="Sair"
                  className="md:hidden p-2 rounded-lg text-theme-secondary hover:text-[var(--accent-red)] transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                </button>
              </Tooltip>
            )}

            {/* Hamburger (mobile/tablet) */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:surface-elevated transition-all cursor-pointer"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Menu mobile/tablet */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-theme" style={{ backgroundColor: 'var(--bg-card)' }}>
            <nav className="px-3 py-3 grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[70vh] overflow-y-auto">
              {allItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-[var(--accent-cyan)]'
                        : 'text-theme-secondary hover:text-theme-primary'
                    }`
                  }
                  style={linkStyle}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {user && (
                <div className="mt-1 pt-3 border-t border-theme col-span-full">
                  <div className="px-3 pb-2">
                    <p className="text-xs font-semibold text-theme-primary truncate">{user.name}</p>
                    <p className="text-[10px] text-theme-muted truncate">{user.company}</p>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Modal de Notificações */}
      {showNotifModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowNotifModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl border border-theme shadow-2xl z-10"
            style={{ backgroundColor: 'var(--bg-base)' }}
            onClick={e => e.stopPropagation()}
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
    </>
  )
}
