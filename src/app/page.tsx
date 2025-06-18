import { ProductGridEnhanced } from "@/components/product-grid-enhanced"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <section className="w-full py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
              Produtos em Destaque
            </h2>
            <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl">
              Confira nossa seleção de produtos de alta qualidade com os melhores preços do mercado.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <ProductGridEnhanced />
        </div>
      </section>
    </main>
  )
}
