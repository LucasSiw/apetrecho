"use client" 

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, CalendarDays, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Definindo um tipo para o Pedido (apenas um exemplo, ajuste conforme seu backend)
type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  rentalDuration?: string; // Ex: "7 dias", "30 dias"
};

type Order = {
  id: string;
  date: string; // Ex: "2025-06-25"
  total: number;
  status: "confirmado" | "processando" | "em_transito" | "entregue" | "cancelado";
  items: OrderItem[];
  paymentMethod: string;
  estimatedDelivery?: string; // Para aluguéis ou compras com entrega
};

export default function MeusPedidosPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return; // Espera a autenticação carregar

    if (!user) {
      console.log("Redirecionando para home - usuário não logado para ver pedidos")
      router.push("/")
      return
    }

    // Função para simular a busca de pedidos do cliente logado
    const fetchUserOrders = async () => {
      setLoadingOrders(true)
      // Simulação de delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Dados de exemplo (substitua pela lógica de busca do seu backend)
      const dummyOrders: Order[] = [
        {
          id: "PED001",
          date: "2025-06-20",
          total: 120.00,
          status: "entregue",
          items: [
            { productId: "prod1", productName: "Camera Fotográfica Pro", productImage: "/placeholder.svg", quantity: 1, price: 100.00, rentalDuration: "7 dias" },
            { productId: "prod2", productName: "Lente Grande Angular", productImage: "/placeholder.svg", quantity: 1, price: 20.00, rentalDuration: "7 dias" },
          ],
          paymentMethod: "Cartão de Crédito",
          estimatedDelivery: "2025-06-22",
        },
        {
          id: "PED002",
          date: "2025-06-24",
          total: 50.00,
          status: "em_transito",
          items: [
            { productId: "prod3", productName: "Drone Mini Portátil", productImage: "/placeholder.svg", quantity: 1, price: 50.00, rentalDuration: "3 dias" },
          ],
          paymentMethod: "PIX",
          estimatedDelivery: "2025-06-27",
        },
        {
          id: "PED003",
          date: "2025-06-25",
          total: 35.00,
          status: "processando",
          items: [
            { productId: "prod4", productName: "Tripé Leve", productImage: "/placeholder.svg", quantity: 1, price: 35.00, rentalDuration: "1 dia" },
          ],
          paymentMethod: "Cartão de Crédito",
        },
      ]
      setOrders(dummyOrders)
      setLoadingOrders(false)
    }

    if (user) { // Apenas busca se o usuário estiver logado
      fetchUserOrders()
    }
  }, [user, authLoading, router]) // Dependências do useEffect

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const getStatusDisplay = (status: Order["status"]) => {
    switch (status) {
      case "confirmado":
        return <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Confirmado</span>
      case "processando":
        return <span className="flex items-center gap-1 text-blue-600"><Clock className="h-4 w-4" /> Processando</span>
      case "em_transito":
        return <span className="flex items-center gap-1 text-yellow-600"><Loader2 className="h-4 w-4 animate-spin" /> Em Trânsito</span>
      case "entregue":
        return <span className="flex items-center gap-1 text-gray-600"><Package className="h-4 w-4" /> Entregue</span>
      case "cancelado":
        return <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /> Cancelado</span>
      default:
        return status;
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8 md:py-12 flex items-center justify-center">
          <Card className="text-center p-8 max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Você precisa estar logado para visualizar seus pedidos.</p>
              <Button asChild>
                <Link href="/login">Fazer Login</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Meus Pedidos</h1>
            <p className="text-muted-foreground">Acompanhe o status dos seus aluguéis e compras.</p>
          </div>
          <Button variant="outline" asChild className="mt-4 md:mt-0">
            <Link href="/">Continuar Comprando/Alugando</Link>
          </Button>
        </div>

        {loadingOrders ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Carregando seus pedidos...</span>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Você ainda não realizou nenhum aluguel ou compra. Explore nossos produtos e encontre o que precisa!
              </p>
              <Button asChild>
                <Link href="/">Começar a Alugar/Comprar</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Pedido #{order.id}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(order.date).toLocaleDateString("pt-BR", {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <div className="font-semibold text-lg">{getStatusDisplay(order.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-md">Itens do Pedido:</h3>
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 border-b pb-2 last:border-b-0 last:pb-0">
                      <img src={item.productImage || "/placeholder.svg"} alt={item.productName} className="h-16 w-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                        {item.rentalDuration && <p className="text-sm text-muted-foreground">Duração: {item.rentalDuration}</p>}
                      </div>
                      <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-lg">Total do Pedido:</span>
                    <span className="font-bold text-xl text-primary">{formatPrice(order.total)}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 text-sm flex justify-between">
                    <span>Método de Pagamento: {order.paymentMethod}</span>
                    {order.estimatedDelivery && (
                        <span className="text-muted-foreground">Previsão de Entrega: {new Date(order.estimatedDelivery).toLocaleDateString("pt-BR")}</span>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}