"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/types/product"
import {
  getAllProducts,
  getFeaturedProducts,
  getUserProducts,
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  searchProducts as searchProductsAction,
} from "@/lib/actions/products"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/app/hooks/use-toast"

export interface ProductInput {
  name: string
  description: string
  price: number
  originalPrice?: number
  category?: string
  stock: number
  image: string
  brand?: string
  isNew: boolean
}

interface ProductsContextType {
  // Produtos gerais
  allProducts: Product[]
  featuredProducts: Product[]

  // Produtos do usuário
  userProducts: Product[]

  // Estados
  loading: boolean
  error: string | null

  // Funções CRUD
  addProduct: (product: ProductInput) => Promise<{ success: boolean; message: string }>
  updateProduct: (productId: string, product: Partial<ProductInput>) => Promise<{ success: boolean; message: string }>
  deleteProduct: (productId: string) => Promise<{ success: boolean; message: string }>

  // Funções de busca e refresh
  refreshProducts: () => Promise<void>
  refreshUserProducts: () => Promise<void>
  searchProducts: (query: string, category?: string) => Promise<Product[]>
  getProductById: (productId: string) => Product | undefined
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()

  // Estados
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar todos os produtos
  const loadAllProducts = async () => {
    try {
      console.log("🔄 Carregando todos os produtos...")
      const products = await getAllProducts()
      console.log("✅ Produtos carregados:", products.length)
      setAllProducts(products)
    } catch (err) {
      console.error("❌ Erro ao carregar produtos:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos")
    }
  }

  // Carregar produtos em destaque
  const loadFeaturedProducts = async () => {
    try {
      console.log("🔄 Carregando produtos em destaque...")
      const products = await getFeaturedProducts()
      console.log("✅ Produtos em destaque carregados:", products.length)
      setFeaturedProducts(products)
    } catch (err) {
      console.error("❌ Erro ao carregar produtos em destaque:", err)
    }
  }

  // Carregar produtos do usuário
  const loadUserProducts = async () => {
    if (!user) {
      setUserProducts([])
      return
    }

    try {
      console.log("🔄 Carregando produtos do usuário:", user.id)
      const products = await getUserProducts(user.id)
      console.log("✅ Produtos do usuário carregados:", products.length)
      setUserProducts(products)
    } catch (err) {
      console.error("❌ Erro ao carregar produtos do usuário:", err)
      setUserProducts([])
    }
  }

  // Carregar todos os dados
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      await Promise.all([loadAllProducts(), loadFeaturedProducts(), loadUserProducts()])
    } catch (err) {
      console.error("❌ Erro geral ao carregar produtos:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Adicionar produto
  const addProduct = async (productData: ProductInput): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message: "Você precisa estar logado para adicionar produtos",
      }
    }

    try {
      const result = await createProductAction({
        ...productData,
        userId: user.id,
      })

      if (result.success) {
        // Recarregar produtos após adicionar
        await Promise.all([loadAllProducts(), loadFeaturedProducts(), loadUserProducts()])

        toast({
          title: "Sucesso",
          description: result.message,
        })
      }

      return result
    } catch (error) {
      console.error("Erro ao adicionar produto:", error)
      return {
        success: false,
        message: "Erro ao adicionar produto. Tente novamente.",
      }
    }
  }

  // Atualizar produto
  const updateProduct = async (
    productId: string,
    productData: Partial<ProductInput>,
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message: "Você precisa estar logado para atualizar produtos",
      }
    }

    try {
      const result = await updateProductAction(productId, {
        ...productData,
        userId: user.id,
      })

      if (result.success) {
        // Recarregar produtos após atualizar
        await Promise.all([loadAllProducts(), loadFeaturedProducts(), loadUserProducts()])

        toast({
          title: "Sucesso",
          description: result.message,
        })
      }

      return result
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      return {
        success: false,
        message: "Erro ao atualizar produto. Tente novamente.",
      }
    }
  }

  // Excluir produto
  const deleteProduct = async (productId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message: "Você precisa estar logado para excluir produtos",
      }
    }

    try {
      const result = await deleteProductAction(productId, user.id)

      if (result.success) {
        // Recarregar produtos após excluir
        await Promise.all([loadAllProducts(), loadFeaturedProducts(), loadUserProducts()])

        toast({
          title: "Sucesso",
          description: result.message,
        })
      }

      return result
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      return {
        success: false,
        message: "Erro ao excluir produto. Tente novamente.",
      }
    }
  }

  // Buscar produtos
  const searchProducts = async (query: string, category?: string): Promise<Product[]> => {
    try {
      return await searchProductsAction(query, category)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      return []
    }
  }

  // Buscar produto por ID
  const getProductById = (productId: string): Product | undefined => {
    // Buscar primeiro nos produtos do usuário, depois em todos os produtos
    return (
      userProducts.find((product) => product.id === productId) ||
      allProducts.find((product) => product.id === productId)
    )
  }

  // Refresh functions
  const refreshProducts = async () => {
    await loadAllProducts()
    await loadFeaturedProducts()
  }

  const refreshUserProducts = async () => {
    await loadUserProducts()
  }

  // Effects
  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    loadUserProducts()
  }, [user])

  const value: ProductsContextType = {
    // Produtos
    allProducts,
    featuredProducts,
    userProducts,

    // Estados
    loading,
    error,

    // Funções CRUD
    addProduct,
    updateProduct,
    deleteProduct,

    // Funções de busca e refresh
    refreshProducts,
    refreshUserProducts,
    searchProducts,
    getProductById,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}
