import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import { ProductsProvider } from "@/context/products-context"
import { OrdersProvider } from "@/context/orders-context"
import { NotificationsProvider } from "@/context/notifications-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "E-Shop - Sua Loja Online",
  description: "E-commerce com os melhores produtos para você",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <ProductsProvider>
                  <OrdersProvider>
                    <NotificationsProvider>{children}</NotificationsProvider>
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
