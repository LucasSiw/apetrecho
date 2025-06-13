"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import type { Product } from "@/types/product"

interface ProductsContextType {
  userProducts: Product[]
  addProduct: (product: Partial<Product>) => Promise<void>
  updateProduct: (product: Partial<Product> & { id: string }) => Promise<void>
  deleteProduct: (productId: string) => void
  getProductById: (productId: string) => Product | undefined
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

// Dados de exemplo para produtos
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

  // Carregar produtos do localStorage ao iniciar
  useEffect(() => {
    if (user) {
      const storedProducts = localStorage.getItem(`user_products_${user.id}`)
      if (storedProducts) {
        try {
          setUserProducts(JSON.parse(storedProducts))
        } catch (error) {
          console.error("Erro ao carregar produtos do localStorage:", error)
          setUserProducts([])
        }
      }
    } else {
      setUserProducts([])
    }
  }, [user])

  // Salvar produtos no localStorage quando mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem(`user_products_${user.id}`, JSON.stringify(userProducts))
    }
  }, [userProducts, user])

  const addProduct = async (productData: Partial<Product>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!user) {
          throw new Error("Você precisa estar logado para adicionar produtos")
        }

        // Simular um delay de processamento
        setTimeout(() => {
          const newProduct: Product = {
            id: `user-product-${Date.now()}`,
            name: productData.name || "Produto sem nome",
            description: productData.description || "Sem descrição",
            price: productData.price || 0,
            image: productData.image || "/placeholder.svg?height=300&width=300",
            category: productData.category,
            stock: productData.stock || 0,
            isNew: productData.isNew || false,
            brand: productData.brand,
            rating: 0,
            reviewCount: 0,
            sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
            originalPrice: productData.originalPrice,
            installments: productData.price
              ? { count: 12, value: Math.round((productData.price / 12) * 100) / 100 }
              : undefined,
          }

          setUserProducts((prev) => [...prev, newProduct])
          resolve()
        }, 800)
      } catch (error) {
        reject(error)
      }
    })
  }

  const updateProduct = async (productData: Partial<Product> & { id: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!user) {
          throw new Error("Você precisa estar logado para atualizar produtos")
        }

        // Simular um delay de processamento
        setTimeout(() => {
          setUserProducts((prev) =>
            prev.map((product) =>
              product.id === productData.id
                ? {
                    ...product,
                    ...productData,
                    installments: productData.price
                      ? { count: 12, value: Math.round((productData.price / 12) * 100) / 100 }
                      : product.installments,
                  }
                : product,
            ),
          )
          resolve()
        }, 800)
      } catch (error) {
        reject(error)
      }
    })
  }

  const deleteProduct = (productId: string): void => {
    setUserProducts((prev) => prev.filter((product) => product.id !== productId))
  }

  const getProductById = (productId: string): Product | undefined => {
    return userProducts.find((product) => product.id === productId)
  }

  return (
    <ProductsContext.Provider
      value={{
        userProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
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
