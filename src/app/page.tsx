import { ProductGrid } from "@/components/product-grid"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <section className="container py-8 md:py-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center px-4">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
              Produtos em Destaque
            </h2>
            <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl">
              Confira nossa seleção de produtos de alta qualidade com os melhores preços do mercado.
            </p>
          </div>
          <ProductGrid />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
