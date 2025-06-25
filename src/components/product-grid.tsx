"use client"

import {
  Dialog, // Keep Dialog for potential future use or if you have other dialogs
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  // DialogTrigger, // REMOVE THIS
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/types/product"
import { useState } from "react"
import Link from "next/link" // IMPORT LINK

interface ProductGridProps {
  products?: Product[]
}

export function ProductGrid({ products = [] }: ProductGridProps) {
  const { addToCart } = useCart()
  // const [selectedProduct, setSelectedProduct] = useState<Product | null>(null) // NO LONGER NEEDED FOR PAGE NAVIGATION

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  if (products.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-lg font-medium">Nenhum produto disponível</p>
          <p className="text-muted-foreground mt-2">
            Volte em breve para ver novos produtos!
          </p>
        </div>
      </div>
    )
  }

  const renderProductCard = (product: Product) => (
    <Link href={`/produto/${product.id}`} passHref key={product.id}>
      <Card
        // onClick={() => setSelectedProduct(product)} // REMOVE THIS
        className="overflow-hidden flex flex-col hover:ring-2 hover:ring-primary cursor-pointer transition-all duration-200"
      >
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
          <CardDescription className="text-xs sm:text-sm line-clamp-3">
            {product.description}
          </CardDescription>
          {product.category && (
            <div className="text-xs text-muted-foreground">Categoria: {product.category}</div>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-lg sm:text-xl font-bold">{formatPrice(product.price)}</div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </div>
          )}
          {product.installments && (
            <div className="text-xs text-muted-foreground mt-1">
              ou {product.installments.count}x de {formatPrice(product.installments.value)}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 space-y-2">
          {/* Prevent navigation when clicking the button */}
          <Button onClick={(e) => {
            e.stopPropagation(); // Stop the event from bubbling up to the Link
            addToCart(product);
          }} className="w-full text-sm" disabled={product.stock === 0}>
            {product.stock === 0 ? "Indisponível" : "Adicionar ao Carrinho"}
          </Button>
          {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-600 text-center">
              Apenas {product.stock} disponível(is)
            </p>
          )}
        </CardFooter>
      </Card>
    </Link>
  )

  return (
    <Dialog> {/* Keep Dialog if you still use it elsewhere in your app */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid gap-4 mt-8 ${
            products.length === 1
              ? "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 max-w-2xl mx-auto"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
          id="produtos"
        >
          {products.map((product) => renderProductCard(product))}
        </div>
      </div>

      {/* REMOVE THE MODAL DETAIL SECTION */}
      {/*
      {selectedProduct && (
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct.name}</DialogTitle>
            <DialogDescription>{selectedProduct.description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <img
              src={selectedProduct.image || "/placeholder.svg"}
              alt={selectedProduct.name}
              className="w-full sm:w-1/2 rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg"
              }}
            />
            <div className="flex-1 space-y-2">
              <p className="text-lg font-bold">{formatPrice(selectedProduct.price)}</p>
              {selectedProduct.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(selectedProduct.originalPrice)}
                </p>
              )}
              {selectedProduct.installments && (
                <p className="text-sm">
                  ou {selectedProduct.installments.count}x de{" "}
                  {formatPrice(selectedProduct.installments.value)}
                </p>
              )}
              {selectedProduct.category && (
                <p className="text-sm text-muted-foreground">
                  Categoria: {selectedProduct.category}
                </p>
              )}
              {selectedProduct.stock !== undefined && selectedProduct.stock <= 5 && (
                <p className="text-sm text-orange-600">
                  Apenas {selectedProduct.stock} em estoque!
                </p>
              )}
              <Button onClick={() => addToCart(selectedProduct)} className="mt-2">
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
      */}
    </Dialog>
  )
}