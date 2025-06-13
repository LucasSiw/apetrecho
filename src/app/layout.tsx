import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import { ProductsProvider } from "@/context/products-context"
import { OrdersProvider } from "@/context/orders-context"
import { NotificationsProvider } from "@/context/notifications-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ToolMart - Sua Loja de Ferramentas Online",
  description: "Encontre as melhores ferramentas para seus projetos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <ProductsProvider>
                  <OrdersProvider>
                    <NotificationsProvider>
                      <div className="relative flex min-h-screen flex-col">
                        <SiteHeader />
                        <main className="flex-1">{children}</main>
                        <SiteFooter />
                      </div>
                      <Toaster />
                    </NotificationsProvider>
                  </OrdersProvider>
                </ProductsProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
