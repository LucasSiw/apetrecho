"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Home, FileText } from "lucide-react"
import { useOrders } from "@/context/orders-context"
import type { Order } from "@/context/orders-context"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getOrderById } = useOrders()
  const [order, setOrder] = useState<Order | null>(null)

  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId)
      setOrder(foundOrder ?? null)
    }
  }, [orderId, getOrderById])

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
            <Button onClick={() => router.push("/")}>Voltar à página inicial</Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Pedido Confirmado!</h1>
            <p className="text-muted-foreground">Seu pedido foi realizado com sucesso e está sendo processado.</p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detalhes do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Número do Pedido:</span>
                  <p className="text-muted-foreground">{order.id}</p>
                </div>
                <div>
                  <span className="font-medium">Data:</span>
                  <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="text-green-600 font-medium">{order.status}</p>
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Itens do Pedido</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Endereço de Entrega</h3>
                <div className="text-sm text-muted-foreground">
                  <p>
                    {order.address.street}, {order.address.number}
                  </p>
                  {order.address.complement && <p>{order.address.complement}</p>}
                  <p>{order.address.neighborhood}</p>
                  <p>
                    {order.address.city}, {order.address.state} - {order.address.zipCode}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Forma de Pagamento</h3>
                <p className="text-sm text-muted-foreground">
                  {order.payment.method === "credit" && "Cartão de Crédito"}
                  {order.payment.method === "debit" && "Cartão de Débito"}
                  {order.payment.method === "pix" && "PIX"}
                  {order.payment.method === "boleto" && "Boleto Bancário"}
                  {order.payment.cardNumber && ` **** ${order.payment.cardNumber.slice(-4)}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Confirmação por Email</p>
                    <p className="text-muted-foreground">
                      Você receberá um email com os detalhes do seu pedido em alguns minutos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Processamento</p>
                    <p className="text-muted-foreground">
                      Seu pedido será processado e preparado para envio em até 2 dias úteis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Acompanhamento</p>
                    <p className="text-muted-foreground">
                      Você receberá o código de rastreamento assim que o pedido for enviado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push("/pedidos")} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Ver Meus Pedidos
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
