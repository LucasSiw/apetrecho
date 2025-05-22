import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Descubra produtos incríveis para o seu dia a dia
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Encontre tudo o que você precisa com os melhores preços e qualidade garantida. Entrega rápida para todo
                o Brasil.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="#produtos">
                <Button size="lg">Ver Produtos</Button>
              </Link>
              <Link href="/ofertas">
                <Button variant="outline" size="lg">
                  Ofertas Especiais
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="Hero Image"
              className="aspect-[4/3] overflow-hidden rounded-xl object-cover"
              height="400"
              src="/placeholder.svg?height=400&width=600"
              width="600"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
