"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag } from "lucide-react"
import { useFavorites } from "@/context/favorites-context"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function FavoritosPage() {
  const { favorites, clearFavorites } = useFavorites()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Meus Favoritos</h1>
            <p className="text-muted-foreground">
              {favorites.length > 0
                ? `Você tem ${favorites.length} produto${favorites.length > 1 ? "s" : ""} favorito${favorites.length > 1 ? "s" : ""}`
                : "Você ainda não tem produtos favoritos"}
            </p>
          </div>
          {favorites.length > 0 && (
            <Button variant="outline" onClick={clearFavorites} className="mt-4 md:mt-0">
              Limpar Favoritos
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Nenhum produto favorito</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Explore nossos produtos e adicione seus favoritos clicando no ícone de coração.
            </p>
            <Button onClick={() => router.push("/")} className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Explorar Produtos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
