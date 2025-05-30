"use client"

import { useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { enhancedProducts } from "@/context/products-context"
import { useProducts } from "@/context/products-context"
import type { Product } from "@/types/product"

interface RelatedProductsProps {
  currentProduct: Product
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const { userProducts } = useProducts()

  const relatedProducts = useMemo(() => {
    const allProducts = [...enhancedProducts, ...userProducts]

    // Filtrar produtos relacionados (mesma categoria, excluindo o produto atual)
    const related = allProducts
      .filter(
        (product) =>
          product.id !== currentProduct.id &&
          (product.category === currentProduct.category || product.brand === currentProduct.brand),
      )
      .slice(0, 4)

    // Se não houver produtos relacionados suficientes, adicionar produtos aleatórios
    if (related.length < 4) {
      const remaining = allProducts
        .filter((product) => product.id !== currentProduct.id && !related.some((r) => r.id === product.id))
        .slice(0, 4 - related.length)

      related.push(...remaining)
    }

    return related
  }, [currentProduct, userProducts])

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
