import { HeroSection } from "@/components/hero-section"
import { ProductGrid } from "@/components/product-grid"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getAllProducts, getFeaturedProducts } from "@/lib/actions/products"

export default async function Home() {
  // Buscar produtos em destaque do banco de dados
  const featuredProducts = await getFeaturedProducts()
  const allProducts = await getAllProducts()

  console.log("Produtos na página inicial:", {
    featured: featuredProducts.length,
    all: allProducts.length,
  })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />

        {/* Seção de Produtos em Destaque */}
        {featuredProducts.length > 0 && (
          <section className="container py-8 md:py-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Produtos em Destaque</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Confira as ferramentas mais recentes disponíveis para aluguel
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <ProductGrid products={featuredProducts.slice(0, 4)} />
            </div>
          </section>
        )}

        {/* Seção de Todos os Produtos */}
        {allProducts.length > 0 && (
          <section className="container py-8 md:py-12 bg-muted/50">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Todas as Ferramentas</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore nossa coleção completa de ferramentas disponíveis
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl items-center gap-6 py-12">
              <ProductGrid products={allProducts} />
            </div>
          </section>
        )}

        {/* Mensagem caso não haja produtos */}
        {featuredProducts.length === 0 && allProducts.length === 0 && (
          <section className="container py-8 md:py-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Em Breve</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Estamos preparando um catálogo incrível de ferramentas para você. Volte em breve!
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
