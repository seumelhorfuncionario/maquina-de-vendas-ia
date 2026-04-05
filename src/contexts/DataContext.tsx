import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lead, Product, Sale, ProductionOrder, LeadStatus, ProductionStatus } from '../types'
import { mockLeads, mockProducts, mockSales, mockProduction } from '../data/mock'

interface DataContextType {
  leads: Lead[]
  products: Product[]
  sales: Sale[]
  production: ProductionOrder[]
  moveLeadStatus: (id: string, status: LeadStatus) => void
  moveProductionStatus: (id: string, status: ProductionStatus) => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
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
    <DataContext.Provider value={{ leads, products, sales, production, moveLeadStatus, moveProductionStatus, addProduct, updateProduct, deleteProduct }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
