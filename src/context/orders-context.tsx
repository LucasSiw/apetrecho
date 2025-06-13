"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import type { Product } from "@/types/product"

interface CartItem extends Product {
  quantity: number
}

interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

interface PaymentData {
  method: "credit" | "debit" | "pix" | "boleto"
  cardNumber?: string
  cardName?: string
  cardExpiry?: string
  cardCvv?: string
  installments?: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  address: Address
  payment: PaymentData
  total: number
  status: string
  createdAt: string
  estimatedDelivery?: string
}

interface OrdersContextType {
  orders: Order[]
  createOrder: (orderData: {
    items: CartItem[]
    address: Address
    payment: PaymentData
    total: number
  }) => Promise<Order>
  getOrderById: (orderId: string) => Order | undefined
  getUserOrders: () => Order[]
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])

  // Carregar pedidos do localStorage ao iniciar
  useEffect(() => {
    if (user) {
      const storedOrders = localStorage.getItem(`orders_${user.id}`)
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders))
        } catch (error) {
          console.error("Erro ao carregar pedidos do localStorage:", error)
          setOrders([])
        }
      }
    } else {
      setOrders([])
    }
  }, [user])

  // Salvar pedidos no localStorage quando mudar
  useEffect(() => {
    if (user && orders.length > 0) {
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(orders))
    }
  }, [orders, user])

  const createOrder = async (orderData: {
    items: CartItem[]
    address: Address
    payment: PaymentData
    total: number
  }): Promise<Order> => {
    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    const order: Order = {
      id: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: user.id,
      items: orderData.items,
      address: orderData.address,
      payment: orderData.payment,
      total: orderData.total,
      status: "Confirmado",
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
    }

    setOrders((prev) => [order, ...prev])
    return order
  }

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((order) => order.id === orderId)
  }

  const getUserOrders = (): Order[] => {
    if (!user) return []
    return orders.filter((order) => String(order.userId) === String(user.id))
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        createOrder,
        getOrderById,
        getUserOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}
