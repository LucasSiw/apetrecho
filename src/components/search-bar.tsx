"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SearchFilters {
  category: string
  minPrice: number
  maxPrice: number
  sortBy: string
}

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilter: (filters: SearchFilters) => void
  filters: SearchFilters
}

const categories = [
  "Todos",
  "Eletrônicos",
  "Smartphones",
  "Notebooks",
  "Audio",
  "TV & Video",
  "Casa & Jardim",
  "Esportes",
]

const sortOptions = [
  { value: "relevance", label: "Mais Relevantes" },
  { value: "price-asc", label: "Menor Preço" },
  { value: "price-desc", label: "Maior Preço" },
  { value: "newest", label: "Mais Recentes" },
  { value: "rating", label: "Melhor Avaliados" },
]

export function SearchBar({ onSearch, onFilter, filters }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [tempFilters, setTempFilters] = useState(filters)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const applyFilters = () => {
    onFilter(tempFilters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    const defaultFilters = {
      category: "Todos",
      minPrice: 0,
      maxPrice: 10000,
      sortBy: "relevance",
    }
    setTempFilters(defaultFilters)
    onFilter(defaultFilters)
  }

  const hasActiveFilters = filters.category !== "Todos" || filters.minPrice > 0 || filters.maxPrice < 10000

  return (
    <div className="w-full space-y-4">
      {/* Barra de Busca Principal */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        <Button type="submit">Buscar</Button>
        <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
              !
            </Badge>
          )}
        </Button>
      </form>

      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {filters.category !== "Todos" && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilter({ ...filters, category: "Todos" })} />
            </Badge>
          )}
          {filters.minPrice > 0 && (
            <Badge variant="secondary" className="gap-1">
              Min: R$ {filters.minPrice}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilter({ ...filters, minPrice: 0 })} />
            </Badge>
          )}
          {filters.maxPrice < 10000 && (
            <Badge variant="secondary" className="gap-1">
              Max: R$ {filters.maxPrice}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilter({ ...filters, maxPrice: 10000 })} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar todos
          </Button>
        </div>
      )}

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-background space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categoria */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {tempFilters.category}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category} onClick={() => setTempFilters({ ...tempFilters, category })}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Faixa de Preço */}
            <div>
              <label className="text-sm font-medium mb-2 block">Preço Mínimo</label>
              <Input
                type="number"
                placeholder="R$ 0"
                value={tempFilters.minPrice || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, minPrice: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preço Máximo</label>
              <Input
                type="number"
                placeholder="R$ 10000"
                value={tempFilters.maxPrice || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, maxPrice: Number(e.target.value) || 10000 })}
              />
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ordenar por</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-between">
                  {sortOptions.find((opt) => opt.value === tempFilters.sortBy)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setTempFilters({ ...tempFilters, sortBy: option.value })}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <Button onClick={applyFilters} className="flex-1">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
