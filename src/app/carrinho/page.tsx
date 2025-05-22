import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartItems } from "@/components/cart-items"

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Seu Carrinho</h1>
            <p className="text-muted-foreground">Revise seus itens e prossiga para o checkout quando estiver pronto.</p>
            <CartItems />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
