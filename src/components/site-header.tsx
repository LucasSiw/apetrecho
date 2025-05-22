"use client"

import Link from "next/link"
import { ShoppingCart, HelpCircle, Home, User, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { useState } from "react"
import { LoginModal } from "@/components/login-modal"
import { RegisterModal } from "@/components/register-modal"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const cartItemsCount = cartItems.length

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">E-Shop</span>
        </Link>
        <nav className="ml-6 flex gap-4 md:gap-6">
          <Link href="/" className="flex items-center text-sm font-medium">
            <Home className="mr-1 h-4 w-4" />
            Início
          </Link>
          <Link href="/carrinho" className="flex items-center text-sm font-medium">
            <ShoppingCart className="mr-1 h-4 w-4" />
            Carrinho
            {cartItemsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {cartItemsCount}
              </Badge>
            )}
          </Link>
          <Link href="/ajuda" className="flex items-center text-sm font-medium">
            <HelpCircle className="mr-1 h-4 w-4" />
            Ajuda
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">Olá, {user.name}!</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/perfil">Meu Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pedidos">Meus Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => setShowLoginModal(true)}>
              Entrar
            </Button>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onRegisterClick={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onLoginClick={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </header>
  )
}
