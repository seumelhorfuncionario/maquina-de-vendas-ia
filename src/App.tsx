import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { TenantProvider } from './contexts/TenantContext'
import { DataProvider } from './contexts/DataContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Vendas from './pages/Vendas'
import Producao from './pages/Producao'
import Financeiro from './pages/Financeiro'
import Produtos from './pages/Produtos'
import IAVision from './pages/IAVision'
import Trafego from './pages/Trafego'
import Criativos from './pages/Criativos'
import SocialOnboarding, { isSocialOnboardingComplete } from './pages/SocialOnboarding'
import SuperAdminRoute from './components/SuperAdminRoute'
import SuperAdminLayout from './components/SuperAdminLayout'
import SuperAdminOverview from './pages/admin/SuperAdminOverview'
import SuperAdminClients from './pages/admin/SuperAdminClients'
import SuperAdminClientForm from './pages/admin/SuperAdminClientForm'
import SuperAdminFeatures from './pages/admin/SuperAdminFeatures'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center surface-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <TenantProvider>
      <DataProvider>
        <Routes>
          <Route path="onboarding/social" element={<SocialOnboarding />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="vendas" element={<Vendas />} />
            <Route path="producao" element={<Producao />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="ia" element={<IAVision />} />
            <Route path="trafego" element={<Trafego />} />
            <Route path="criativos" element={<CriativosGate />} />
          </Route>
        </Routes>
      </DataProvider>
    </TenantProvider>
  )
}

function CriativosGate() {
  const { clientProfile, user } = useAuth()
  const clientId = clientProfile?.id || user?.id || null
  if (!isSocialOnboardingComplete(clientId)) {
    return <Navigate to="/onboarding/social" replace />
  }
  return <Criativos />
}

export default function App() {
  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/super-admin/*"
              element={
                <SuperAdminRoute>
                  <SuperAdminLayout />
                </SuperAdminRoute>
              }
            >
              <Route index element={<SuperAdminOverview />} />
              <Route path="clients" element={<SuperAdminClients />} />
              <Route path="clients/new" element={<SuperAdminClientForm />} />
              <Route path="clients/:id/edit" element={<SuperAdminClientForm />} />
              <Route path="features" element={<SuperAdminFeatures />} />
            </Route>
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </ThemeProvider>
  )
}
