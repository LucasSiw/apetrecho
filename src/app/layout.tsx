import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import { ProductsProvider } from "@/context/products-context"
import { NotificationsProvider } from "@/context/notifications-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Apetrecho",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <ProductsProvider>
                  <NotificationsProvider>{children}</NotificationsProvider>
                </ProductsProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
