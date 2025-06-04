"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useProducts } from "@/context/products-context" // Keep this import

interface SearchFilters {
  category: string
  minPrice: number
  maxPrice: number
  sortBy: string
}

export function ProductGridEnhanced() {
  const { userProducts } = useProducts() // Only destructure userProducts from context
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    category: "Todos",
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "relevance",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [internalLoading, setInternalLoading] = useState(false) // Use an internal loading state for search/filter delays
  const itemsPerPage = 8

  // Example static products array; replace with your actual static products or import as needed
  const staticProducts = [
     {
       id: "1",
       name: "Produto Exemplo",
       description: "Descrição do produto exemplo.",
       category: "Categoria",
       price: 100,
       brand: "Marca",
       rating: 4.5,
       stock: 10,
       isNew: true,
       image: "/placeholder.png", // Add a valid image path or placeholder
     },
  ];

  // Combine products from the system with products from the user
  const allProducts = useMemo(() => {
    // Ensure userProducts is an array before spreading
    const productsFromUser = Array.isArray(userProducts) ? userProducts : [];
    return [...staticProducts, ...productsFromUser];
  }, [userProducts]) // Depend on userProducts to re-calculate if they change

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (filters.category !== "Todos") {
      filtered = filtered.filter((product) => product.category === filters.category)
    }

    // Filter by price
    filtered = filtered.filter((product) => product.price >= filters.minPrice && product.price <= filters.maxPrice)

    // Sort
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
        // Assuming 'isNew' is a boolean flag for new products
        // Products marked as new come first, then others
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break
      default:
        // Relevance (in-stock products first, then by rating)
        filtered.sort((a, b) => {
          // Prioritize products with stock
          const aHasStock = (a.stock || 0) > 0;
          const bHasStock = (b.stock || 0) > 0;

          if (aHasStock && !bHasStock) return -1; // a comes before b
          if (!aHasStock && bHasStock) return 1;  // b comes before a

          // If both have or don't have stock, then sort by rating
          return (b.rating || 0) - (a.rating || 0);
        })
    }

    return filtered
  }, [searchQuery, filters, allProducts])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSearch = (query: string) => {
    setInternalLoading(true) // Use internal loading for UI feedback
    setSearchQuery(query)
    setCurrentPage(1)
    setTimeout(() => setInternalLoading(false), 500) // Simulate delay
  }

  const handleFilter = (newFilters: SearchFilters) => {
    setInternalLoading(true) // Use internal loading for UI feedback
    setFilters(newFilters)
    setCurrentPage(1)
    setTimeout(() => setInternalLoading(false), 300) // Simulate delay
  }

  // Determine overall loading state (either user products fetching or internal search/filter)
  // Only use internalLoading for loading state
  const isLoading = internalLoading;

  // No error state from context
  const hasError = false;


  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Barra de Busca e Filtros */}
      <SearchBar onSearch={handleSearch} onFilter={handleFilter} filters={filters} />

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Buscando produtos..."
          ) : hasError ? (
            `Erro ao carregar produtos: ${hasError}`
          ) : (
            <>
              Mostrando {paginatedProducts.length} de {filteredProducts.length} produtos
              {searchQuery && ` para "${searchQuery}"`}
            </>
          )}
        </p>
      </div>

      {/* Grid de Produtos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando produtos...</span>
        </div>
      ) : hasError ? (
        <div className="text-center text-red-500 py-8">
          <p>Erro ao carregar produtos. Por favor, tente novamente.</p>
          {/* You might want a retry button here */}
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
      {totalPages > 1 && !isLoading && !hasError && ( // Only show pagination if not loading and no error
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