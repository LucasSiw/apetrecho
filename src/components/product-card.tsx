"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Star, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import type { Product } from "@/types/product"
import Link from "next/link"

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart()
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites()
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const isFavorite = favorites.some((fav) => fav.id === product.id)
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isFavorite) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="secondary" className="text-xs">
              Novo
            </Badge>
          )}
          {product.stock && product.stock < 5 && (
            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
              Últimas unidades
            </Badge>
          )}
        </div>

        {/* Botão de Favorito */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full transition-all ${
            isFavorite
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-600"
          }`}
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>

        {/* Imagem do Produto */}
        <Link href={`/produto/${product.id}`}>
          <div className="relative h-full w-full">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={imageError ? "/placeholder.svg?height=300&width=300" : product.image}
              alt={product.name}
              className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          </div>
        </Link>

        {/* Overlay com ações rápidas */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleQuickView} className="bg-white/90 hover:bg-white">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button variant="default" size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              Alugar
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/produto/${product.id}`}>
          <div className="space-y-2">
            {/* Categoria */}
            {product.category && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</p>
            )}

            {/* Nome do Produto */}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Avaliação */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
              </div>
            )}

            {/* Preços */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice!)}
                  </span>
                )}
              </div>

              {product.installments && (
                <p className="text-xs text-muted-foreground">
                  ou {product.installments.count}x de {formatPrice(product.installments.value)} sem juros
                </p>
              )}
            </div>
          </div>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full"
          disabled={product.stock === 0}
          variant={product.stock === 0 ? "secondary" : "default"}
        >
          {product.stock === 0 ? (
            "Esgotado"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
