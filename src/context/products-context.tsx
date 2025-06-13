"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import { createProduct, updateProduct, deleteProduct, getUserProducts } from "@/lib/products"
import type { Product } from "@/types/product"

interface ProductsContextType {
  userProducts: Product[]
  loading: boolean
  addProduct: (product: Partial<Product>) => Promise<{ success: boolean; message: string }>
  updateProduct: (product: Partial<Product> & { id: string }) => Promise<{ success: boolean; message: string }>
  deleteProduct: (productId: string) => Promise<{ success: boolean; message: string }>
  getProductById: (productId: string) => Product | undefined
  refreshProducts: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

// Dados de exemplo para produtos (mantidos para exibição geral)
const enhancedProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    description: "O iPhone mais avançado com chip A17 Pro e câmera de 48MP",
    price: 8999.99,
    originalPrice: 9999.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Smartphones",
    rating: 4.8,
    reviewCount: 1247,
    stock: 15,
    isNew: true,
    installments: { count: 12, value: 749.99 },
    brand: "Apple",
    sku: "IPH15PM256",
  },
  {
    id: "2",
    name: 'MacBook Air M2 13" 512GB',
    description: "Notebook ultrafino com chip M2 e tela Liquid Retina",
    price: 12999.99,
    originalPrice: 14999.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Notebooks",
    rating: 4.9,
    reviewCount: 892,
    stock: 8,
    installments: { count: 12, value: 1083.33 },
    brand: "Apple",
    sku: "MBA13M2512",
  },
  {
    id: "3",
    name: "AirPods Pro 2ª Geração",
    description: "Fones com cancelamento ativo de ruído e áudio espacial",
    price: 2299.99,
    originalPrice: 2799.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Audio",
    rating: 4.7,
    reviewCount: 2156,
    stock: 25,
    installments: { count: 10, value: 229.99 },
    brand: "Apple",
    sku: "APP2GEN",
  },
  {
    id: "4",
    name: 'Samsung Smart TV 65" 4K QLED',
    description: "TV QLED com tecnologia Quantum Dot e Tizen OS",
    price: 4999.99,
    originalPrice: 6999.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "TV & Video",
    rating: 4.6,
    reviewCount: 543,
    stock: 3,
    installments: { count: 12, value: 416.66 },
    brand: "Samsung",
    sku: "QLED65Q80C",
  },
  {
    id: "5",
    name: "Sony Alpha A7 IV Mirrorless",
    description: "Câmera profissional com sensor full-frame de 33MP",
    price: 15999.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Câmeras",
    rating: 4.9,
    reviewCount: 234,
    stock: 5,
    installments: { count: 12, value: 1333.33 },
    brand: "Sony",
    sku: "ILCE7M4",
  },
  {
    id: "6",
    name: "Apple Watch Series 9 45mm",
    description: "Smartwatch com GPS, tela Always-On e monitoramento de saúde",
    price: 3999.99,
    originalPrice: 4499.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Smartwatches",
    rating: 4.8,
    reviewCount: 1876,
    stock: 12,
    isNew: true,
    installments: { count: 12, value: 333.33 },
    brand: "Apple",
    sku: "AWS945MM",
  },
  {
    id: "7",
    name: "PlayStation 5 Console",
    description: "Console de nova geração com SSD ultra-rápido",
    price: 4199.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Games",
    rating: 4.7,
    reviewCount: 3421,
    stock: 0, // Esgotado
    installments: { count: 12, value: 349.99 },
    brand: "Sony",
    sku: "PS5CONSOLE",
  },
  {
    id: "8",
    name: "Kindle Oasis 32GB",
    description: 'E-reader premium com tela de 7" e luz ajustável',
    price: 1299.99,
    originalPrice: 1599.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "E-readers",
    rating: 4.5,
    reviewCount: 892,
    stock: 18,
    installments: { count: 10, value: 129.99 },
    brand: "Amazon",
    sku: "KOASIS32",
  },
]

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Carregar produtos do banco de dados
  const loadUserProducts = async () => {
    if (!user) {
      setUserProducts([])
      return
    }

    setLoading(true)
    try {
      const products = await getUserProducts(user.id)
      setUserProducts(products)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      setUserProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserProducts()
  }, [user])

  const addProduct = async (productData: Partial<Product>) => {
    if (!user) {
      return {
        success: false,
        message: "Você precisa estar logado para adicionar produtos",
      }
    }

    try {
      const result = await createProduct({
        name: productData.name || "Produto sem nome",
        description: productData.description || "Sem descrição",
        price: productData.price || 0,
        originalPrice: productData.originalPrice,
        category: productData.category,
        stock: productData.stock || 0,
        image: productData.image || "/placeholder.svg?height=300&width=300",
        brand: productData.brand,
        isNew: productData.isNew || false,
        userId: user.id,
      })

      if (result.success) {
        await loadUserProducts() // Recarregar produtos
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

  const updateProductHandler = async (productData: Partial<Product> & { id: string }) => {
    if (!user) {
      return {
        success: false,
        message: "Você precisa estar logado para atualizar produtos",
      }
    }

    try {
      const result = await updateProduct(productData.id, {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        originalPrice: productData.originalPrice,
        category: productData.category,
        stock: productData.stock,
        image: productData.image,
        brand: productData.brand,
        isNew: productData.isNew,
        userId: user.id,
      })

      if (result.success) {
        await loadUserProducts() // Recarregar produtos
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

  const deleteProductHandler = async (productId: string) => {
    if (!user) {
      return {
        success: false,
        message: "Você precisa estar logado para excluir produtos",
      }
    }

    try {
      const result = await deleteProduct(productId, user.id)

      if (result.success) {
        await loadUserProducts() // Recarregar produtos
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

  const getProductByIdHandler = (productId: string): Product | undefined => {
    return userProducts.find((product) => product.id === productId)
  }

  const refreshProducts = async () => {
    await loadUserProducts()
  }

  return (
    <ProductsContext.Provider
      value={{
        userProducts,
        loading,
        addProduct,
        updateProduct: updateProductHandler,
        deleteProduct: deleteProductHandler,
        getProductById: getProductByIdHandler,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}

// Exportar os produtos de exemplo para uso em outros componentes
export { enhancedProducts }
