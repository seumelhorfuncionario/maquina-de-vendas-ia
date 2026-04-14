import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lead, Product, Sale, ProductionOrder, LeadStatus, ProductionStatus } from '../types'
import { mockLeads, mockProducts, mockSales, mockProduction } from '../data/mock'
import { useAuth } from './AuthContext'
import { useLeads } from '@/hooks/useLeads'
import { useProducts } from '@/hooks/useProducts'
import { useSales } from '@/hooks/useSales'
import { useProduction } from '@/hooks/useProduction'
import { useKanbanAutoSync } from '@/hooks/useKanbanAutoSync'

interface DataContextType {
  leads: Lead[]
  products: Product[]
  sales: Sale[]
  production: ProductionOrder[]
  loading: boolean
  moveLeadStatus: (id: string, status: LeadStatus) => void
  moveProductionStatus: (id: string, status: ProductionStatus) => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
}

const DataContext = createContext<DataContextType | null>(null)

function DemoDataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [sales] = useState<Sale[]>(mockSales)
  const [production, setProduction] = useState<ProductionOrder[]>(mockProduction)

  const moveLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const moveProductionStatus = (id: string, status: ProductionStatus) => {
    setProduction(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product])
  }

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p))
  }

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <DataContext.Provider value={{
      leads, products, sales, production, loading: false,
      moveLeadStatus, moveProductionStatus, addProduct, updateProduct, deleteProduct,
    }}>
      {children}
    </DataContext.Provider>
  )
}

/**
 * Wrapper que garante sync do kanban ANTES de montar os hooks de dados.
 * Isso evita race condition onde useLeads/useProduction buscam dados velhos
 * enquanto o sync ainda está rodando.
 */
function RealDataProvider({ children }: { children: ReactNode }) {
  const { synced } = useKanbanAutoSync()

  if (!synced) {
    return (
      <DataContext.Provider value={{
        leads: [], products: [], sales: [], production: [], loading: true,
        moveLeadStatus: () => {}, moveProductionStatus: () => {},
        addProduct: () => {}, updateProduct: () => {}, deleteProduct: () => {},
      }}>
        {children}
      </DataContext.Provider>
    )
  }

  return <RealDataAfterSync>{children}</RealDataAfterSync>
}

/** Só monta depois que o sync finalizou — hooks buscam dados já atualizados */
function RealDataAfterSync({ children }: { children: ReactNode }) {
  const {
    leads,
    loading: leadsLoading,
    moveLeadStatus,
  } = useLeads()

  const {
    products,
    loading: productsLoading,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts()

  const {
    sales,
    loading: salesLoading,
  } = useSales()

  const {
    production,
    loading: productionLoading,
    moveProductionStatus,
  } = useProduction()

  const loading = leadsLoading || productsLoading || salesLoading || productionLoading

  return (
    <DataContext.Provider value={{
      leads, products, sales, production, loading,
      moveLeadStatus, moveProductionStatus, addProduct, updateProduct, deleteProduct,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { isDemo } = useAuth()

  if (isDemo) {
    return <DemoDataProvider>{children}</DemoDataProvider>
  }

  return <RealDataProvider>{children}</RealDataProvider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
