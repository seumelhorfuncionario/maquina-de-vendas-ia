import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'
import type { Product } from '../types'

export const useProducts = () => {
  const { clientId, loading: clientLoading } = useClientId()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('product_name', { ascending: true })

      if (fetchError) throw fetchError

      const mapped: Product[] = (data || []).map(p => ({
        id: p.id,
        name: p.product_name,
        size: p.size || '',
        price: p.price,
        cost: p.cost || 0,
        margin: p.price > 0 && p.cost ? Math.round(((p.price - p.cost) / p.price) * 100) : 100,
        image: p.image_url || undefined,
      }))

      setProducts(mapped)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Erro ao buscar produtos')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (!clientLoading && clientId) {
      fetchProducts()
    } else if (!clientLoading) {
      setLoading(false)
    }
  }, [clientId, clientLoading, fetchProducts])

  const addProduct = async (product: Product) => {
    if (!clientId) return

    setProducts(prev => [...prev, product])

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          client_id: clientId,
          product_name: product.name,
          price: product.price,
          cost: product.cost || null,
          size: product.size || null,
          is_active: true,
        })

      if (error) {
        console.error('Error adding product:', error)
        fetchProducts()
      }
    } catch (err) {
      console.error('Error adding product:', err)
      fetchProducts()
    }
  }

  const updateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p))

    try {
      const { error } = await supabase
        .from('products')
        .update({
          product_name: product.name,
          price: product.price,
          cost: product.cost || null,
          size: product.size || null,
        })
        .eq('id', product.id)

      if (error) {
        console.error('Error updating product:', error)
        fetchProducts()
      }
    } catch (err) {
      console.error('Error updating product:', err)
      fetchProducts()
    }
  }

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
        fetchProducts()
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      fetchProducts()
    }
  }

  return { products, loading, error, addProduct, updateProduct, deleteProduct, refetch: fetchProducts }
}
