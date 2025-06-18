"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Package, DollarSign, Users, Eye, Plus, Calendar } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useProducts } from "@/context/products-context"
import { useOrders } from "@/context/orders-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const { userProducts } = useProducts()
  const { orders } = useOrders()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Calcular estatísticas
  const stats = useMemo(() => {
    // Filtrar pedidos que contêm produtos do usuário
    const userOrders = orders.filter((order) =>
      order.items.some((item) => userProducts.some((product) => product.id === item.id)),
    )

    const totalRevenue = userOrders.reduce((sum, order) => {
      const userItemsValue = order.items
        .filter((item) => userProducts.some((product) => product.id === item.id))
        .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0)
      return sum + userItemsValue
    }, 0)

    const totalSales = userOrders.reduce((sum, order) => {
      const userItemsQuantity = order.items
        .filter((item) => userProducts.some((product) => product.id === item.id))
        .reduce((itemSum, item) => itemSum + item.quantity, 0)
      return sum + userItemsQuantity
    }, 0)

    const totalProducts = userProducts.length
    const activeProducts = userProducts.filter((product) => (product.stock || 0) > 0).length

    return {
      totalRevenue,
      totalSales,
      totalProducts,
      activeProducts,
      totalOrders: userOrders.length,
    }
  }, [orders, userProducts])

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Produtos mais vendidos
  const topProducts = useMemo(() => {
    const productSales = new Map()

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (userProducts.some((product) => product.id === item.id)) {
          const current = productSales.get(item.id) || { ...item, totalSold: 0, revenue: 0 }
          current.totalSold += item.quantity
          current.revenue += item.price * item.quantity
          productSales.set(item.id, current)
        }
      })
    })

    return Array.from(productSales.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
  }, [orders, userProducts])

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Dashboard de Vendas</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho dos seus produtos</p>
          </div>
          <Button onClick={() => router.push("/meus-produtos")}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">+15% em relação ao mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">{stats.activeProducts} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">+5 novos esta semana</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtos Mais Vendidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Produtos Mais Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topProducts.length > 0 ? (
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.totalSold} vendidos • {formatPrice(product.revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma venda registrada ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Atividade Recente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => {
                      const userItems = order.items.filter((item) =>
                        userProducts.some((product) => product.id === item.id),
                      )

                      if (userItems.length === 0) return null

                      return (
                        <div key={order.id} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Novo pedido #{order.id.slice(-8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {userItems.length} item{userItems.length > 1 ? "s" : ""} •{" "}
                              {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seus Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {userProducts.length > 0 ? (
                  <div className="space-y-4">
                    {userProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                            <Badge variant={product.stock && product.stock > 0 ? "secondary" : "destructive"}>
                              {product.stock || 0} em estoque
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Você ainda não tem produtos cadastrados</p>
                    <Button onClick={() => router.push("/meus-produtos")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Primeiro Produto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Gráficos de vendas em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Em breve você poderá visualizar gráficos detalhados das suas vendas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
