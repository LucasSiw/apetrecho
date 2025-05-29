"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "./search-bar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Product } from "@/types/product"

export interface SearchFilters {
  category: string
  minPrice: number
  maxPrice: number
  sortBy: string
}

// Dados expandidos para demonstração
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

export function ProductGridEnhanced() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    category: "Todos",
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "relevance",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 8

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let filtered = enhancedProducts

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filtro por categoria
    if (filters.category !== "Todos") {
      filtered = filtered.filter((product) => product.category === filters.category)
    }

    // Filtro por preço
    filtered = filtered.filter((product) => product.price >= filters.minPrice && product.price <= filters.maxPrice)

    // Ordenação
    switch (filters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        // Relevância (produtos em estoque primeiro, depois por rating)
        filtered.sort((a, b) => {
          if ((a.stock || 0) > 0 && (b.stock || 0) === 0) return -1
          if ((a.stock || 0) === 0 && (b.stock || 0) > 0) return 1
          return (b.rating || 0) - (a.rating || 0)
        })
    }

    return filtered
  }, [searchQuery, filters])

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSearch = (query: string) => {
    setLoading(true)
    setSearchQuery(query)
    setCurrentPage(1)
    // Simular delay de busca
    setTimeout(() => setLoading(false), 500)
  }

  const handleFilter = (newFilters: SearchFilters) => {
    setLoading(true)
    setFilters(newFilters)
    setCurrentPage(1)
    // Simular delay de filtro
    setTimeout(() => setLoading(false), 300)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Barra de Busca e Filtros */}
      <SearchBar onSearch={handleSearch} onFilter={handleFilter} filters={filters} />

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            "Buscando produtos..."
          ) : (
            <>
              Mostrando {paginatedProducts.length} de {filteredProducts.length} produtos
              {searchQuery && ` para "${searchQuery}"`}
            </>
          )}
        </p>
      </div>

      {/* Grid de Produtos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando produtos...</span>
        </div>
      ) : paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-muted-foreground mt-2">Tente ajustar os filtros ou buscar por outros termos</p>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                )
              }
              return null
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}
