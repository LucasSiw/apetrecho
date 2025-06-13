"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/types/product"

interface CartItem extends Product {
  quantity: number
}

interface Coupon {
  code: string
  discount: number
  type: "percentage" | "fixed"
  minValue?: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  appliedCoupon: Coupon | null
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Cupons de exemplo
const availableCoupons: Coupon[] = [
  { code: "DESCONTO10", discount: 10, type: "percentage" },
  { code: "FRETE50", discount: 50, type: "fixed" },
  { code: "PRIMEIRA20", discount: 20, type: "percentage", minValue: 100 },
  { code: "BLACKFRIDAY", discount: 25, type: "percentage", minValue: 200 },
]

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }

      const storedCoupon = localStorage.getItem("appliedCoupon")
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon))
      }
    } catch (error) {
      console.error("Erro ao carregar dados do carrinho:", error)
      localStorage.removeItem("cart")
      localStorage.removeItem("appliedCoupon")
    }
  }, [])

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  // Salvar cupom no localStorage quando mudar
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon))
    } else {
      localStorage.removeItem("appliedCoupon")
    }
  }, [appliedCoupon])

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      // Verificar se o produto já está no carrinho
      const existingItem = prevItems.find((item) => item.id === product.id)

      if (existingItem) {
        // Se já existe, aumentar a quantidade
        return prevItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        // Se não existe, adicionar com quantidade 1
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    setCartItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    setAppliedCoupon(null)
  }

  const applyCoupon = (code: string): boolean => {
    const coupon = availableCoupons.find((c) => c.code.toLowerCase() === code.toLowerCase())

    if (!coupon) {
      return false
    }

    const subtotal = getSubtotal()
    if (coupon.minValue && subtotal < coupon.minValue) {
      return false
    }

    setAppliedCoupon(coupon)
    return true
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getDiscount = () => {
    if (!appliedCoupon) return 0

    const subtotal = getSubtotal()

    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.discount) / 100
    } else {
      return Math.min(appliedCoupon.discount, subtotal)
    }
  }

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount())
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getSubtotal,
        getDiscount,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
