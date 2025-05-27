"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="w-full py-8 md:py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center max-w-7xl mx-auto">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                Descubra produtos incríveis para o seu dia a dia
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl mx-auto lg:mx-0">
                Encontre tudo o que você precisa com os melhores preços e qualidade garantida. Entrega rápida para todo
                o Brasil.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="#produtos">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver Produtos
                </Button>
              </Link>
              <Link href="/ofertas">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ofertas Especiais
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center order-first lg:order-last">
            <div className="relative w-full max-w-[500px]">
              <img
                alt="Ferramentas e produtos para casa - E-Shop"
                className="aspect-[4/3] w-full overflow-hidden rounded-xl object-cover shadow-lg"
                src="/images/hero-tools.jpg"
                loading="eager"
              />
              {/* Overlay sutil para melhor contraste */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
