"use client"

import Link from "next/link"
import { ShoppingCart, HelpCircle, Home, User, LogOut, Menu, X } from "lucide-react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const cartItemsCount = cartItems.length

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg sm:text-xl">E-Shop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-6 hidden md:flex gap-4 lg:gap-6">
          <Link href="/" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
            <Home className="mr-1 h-4 w-4" />
            Início
          </Link>
          <Link href="/carrinho" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
            <ShoppingCart className="mr-1 h-4 w-4" />
            Carrinho
            {cartItemsCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </Link>
          <Link href="/ajuda" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
            <HelpCircle className="mr-1 h-4 w-4" />
            Ajuda
          </Link>
        </nav>

        {/* Desktop User Menu */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">Olá, {user.name}!</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
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
            <Button variant="outline" size="sm" onClick={() => setShowLoginModal(true)}>
              Entrar
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="ml-auto flex md:hidden items-center gap-2">
          {/* Cart Icon for Mobile */}
          <Link href="/carrinho" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ShoppingCart className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container px-4 py-4 space-y-3">
            <Link
              href="/"
              className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="mr-3 h-4 w-4" />
              Início
            </Link>
            <Link
              href="/carrinho"
              className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="mr-3 h-4 w-4" />
              Carrinho
              {cartItemsCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Link>
            <Link
              href="/ajuda"
              className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="mr-3 h-4 w-4" />
              Ajuda
            </Link>

            <div className="pt-3 border-t">
              {user ? (
                <div className="space-y-3">
                  <div className="py-2">
                    <p className="font-medium text-sm">Olá, {user.name}!</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/perfil"
                    className="block py-2 text-sm transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    href="/pedidos"
                    className="block py-2 text-sm transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meus Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center py-2 text-sm text-red-500 transition-colors hover:text-red-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sair
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowLoginModal(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  Entrar
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

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
