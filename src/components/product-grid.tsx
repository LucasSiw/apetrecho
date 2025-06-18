"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/types/product"

interface ProductGridProps {
  products?: Product[]
}

export function ProductGrid({ products = [] }: ProductGridProps) {
  const { addToCart } = useCart()

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Se não há produtos, mostrar mensagem
  if (products.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-lg font-medium">Nenhum produto disponível</p>
          <p className="text-muted-foreground mt-2">Volte em breve para ver novos produtos!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8" id="produtos">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden flex flex-col">
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image || "/placeholder.svg?height=200&width=200"}
                alt={product.name}
                className="h-full w-full object-cover transition-all hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=200&width=200"
                }}
              />
            </div>
            <CardHeader className="flex-1 p-4">
              <CardTitle className="text-base sm:text-lg line-clamp-2">{product.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-3">{product.description}</CardDescription>
              {product.category && <div className="text-xs text-muted-foreground">Categoria: {product.category}</div>}
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg sm:text-xl font-bold">{formatPrice(product.price)}</div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</div>
              )}
              {product.installments && (
                <div className="text-xs text-muted-foreground mt-1">
                  ou {product.installments.count}x de {formatPrice(product.installments.value)}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 space-y-2">
              <Button onClick={() => addToCart(product)} className="w-full text-sm" disabled={product.stock === 0}>
                {product.stock === 0 ? "Indisponível" : "Adicionar ao Carrinho"}
              </Button>
              {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                <p className="text-xs text-orange-600 text-center">Apenas {product.stock} disponível(is)</p>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
