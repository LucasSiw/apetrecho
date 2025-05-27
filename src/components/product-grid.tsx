"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/types/product"

// Dados de exemplo para produtos
const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone XYZ",
    description: "Smartphone de última geração com câmera de alta resolução",
    price: 1999.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    name: "Notebook Ultra",
    description: "Notebook leve e potente para trabalho e entretenimento",
    price: 3499.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    name: "Fone de Ouvido Bluetooth",
    description: "Fone sem fio com cancelamento de ruído",
    price: 299.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "4",
    name: "Smart TV 4K",
    description: "TV com resolução 4K e sistema operacional inteligente",
    price: 2599.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "5",
    name: "Câmera Digital",
    description: "Câmera profissional para fotos de alta qualidade",
    price: 1899.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "6",
    name: "Relógio Inteligente",
    description: "Monitore sua saúde e receba notificações",
    price: 499.99,
    image: "/placeholder.svg?height=200&width=200",
  },
]

export function ProductGrid() {
  const { addToCart } = useCart()
  const [products] = useState<Product[]>(dummyProducts)

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8 px-4 sm:px-0"
      id="produtos"
    >
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden flex flex-col">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover transition-all hover:scale-105"
            />
          </div>
          <CardHeader className="flex-1 p-4">
            <CardTitle className="text-base sm:text-lg line-clamp-2">{product.name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-3">{product.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg sm:text-xl font-bold">{formatPrice(product.price)}</div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button onClick={() => addToCart(product)} className="w-full text-sm">
              Adicionar ao Carrinho
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
