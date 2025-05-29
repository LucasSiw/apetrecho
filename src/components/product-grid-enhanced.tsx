"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { enhancedProducts } from "@/context/products-context"
import { useProducts } from "@/context/products-context"

interface SearchFilters {
  category: string
  minPrice: number
  maxPrice: number
  sortBy: string
}

export function ProductGridEnhanced() {
  const { userProducts } = useProducts()
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

  // Combinar produtos do sistema com produtos do usuário
  const allProducts = useMemo(() => {
    return [...enhancedProducts, ...userProducts]
  }, [userProducts])

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

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
  }, [searchQuery, filters, allProducts])

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
