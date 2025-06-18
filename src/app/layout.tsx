import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import { NotificationsProvider } from "@/context/notifications-context"
import { OrdersProvider } from "@/context/orders-context"
import { ProductsProvider } from "@/context/products-context"
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "E-commerce - Ferramentas",
  description: "Plataforma de aluguel de ferramentas",
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
            <ProductsProvider>
              <CartProvider>
                <FavoritesProvider>
                  <NotificationsProvider>
                    <OrdersProvider>
                      <div className="relative flex min-h-screen flex-col">
                        <SiteHeader />
                        <main className="flex-1">{children}</main>
                        <SiteFooter />
                      </div>
                      <Toaster />
                    </OrdersProvider>
                  </NotificationsProvider>
                </FavoritesProvider>
              </CartProvider>
            </ProductsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
