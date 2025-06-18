"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingBag, Eye, Truck } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useOrders } from "@/context/orders-context"

export default function OrdersPage() {
  const { user } = useAuth()
  const { getUserOrders } = useOrders()
  const router = useRouter()

  const orders = getUserOrders()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmado":
        return "bg-blue-100 text-blue-800"
      case "processando":
        return "bg-yellow-100 text-yellow-800"
      case "enviado":
        return "bg-purple-100 text-purple-800"
      case "entregue":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Meus Pedidos</h1>
            <p className="text-muted-foreground">
              {orders.length > 0
                ? `Você tem ${orders.length} pedido${orders.length > 1 ? "s" : ""}`
                : "Você ainda não fez nenhum pedido"}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground text-center mb-6">
                Você ainda não fez nenhum pedido. Que tal começar a explorar nossos produtos?
              </p>
              <Button onClick={() => router.push("/")}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Começar a Comprar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Pedido {order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Realizado em {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Items Preview */}
                    <div>
                      <h4 className="font-medium mb-3">Itens ({order.items.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-background">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qtd: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                            +{order.items.length - 3} item{order.items.length - 3 > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>
                          Entrega prevista:{" "}
                          {order.estimatedDelivery
                            ? new Date(order.estimatedDelivery).toLocaleDateString("pt-BR")
                            : "A definir"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/pedido-confirmado?orderId=${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        {order.status.toLowerCase() === "enviado" && (
                          <Button size="sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Rastrear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
