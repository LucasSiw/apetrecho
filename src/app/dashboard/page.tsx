// components/DashboardPage.tsx (ou onde estiver seu componente Dashboard)

"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Plus
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
// Importe seu action do backend. Se for um Next.js API Route, você fará um `fetch` para ele.
// Se for uma função de server action (Next.js App Router), o import seria direto.
// Suponho que 'getDashboardData' que você importou é a função de fetch do lado do cliente
// ou que será usada internamente pelo 'fetchDashboardData' abaixo.
// Não é necessário importar getDashboardData diretamente no componente se você for usar `fetch`.
// import { getDashboardData } from "@/lib/actions/attdashaluguel"; // REMOVA ESTA LINHA SE ESTIVER USANDO `fetch` API

// --- Tipagens (mantidas e refinadas) ---
interface Product {
  id: number | bigint;
  name: string;
  description?: string;
  image?: string; // Corresponde a bdURLIMG
  price: number; // Corresponde a bdPrecoAluguel (já convertido para number)
  stock?: number;
}

interface RentalItem {
  id: number | bigint; // ID da ferramenta
  name: string;
  image?: string;
  price: number; // Já convertido para number
  rentalId: number | bigint;
  rentalStatus?: string;
  rentalStartDate: Date;
  rentalEndDate?: Date;
  clientName?: string;
  clientId?: number;
}

interface Order {
  id: number;
  type: "SALE" | "RENTAL"; // Se você tiver ambos os tipos de transação
  userId: number; // ID do usuário que fez a ordem (o comprador/locatário)
  items: Array<{
    id: number | bigint; // ID do produto/ferramenta na ordem
    price: number;
    quantity: number;
  }>;
}

// --- Componente DashboardPage ---
export default function DashboardPage() {
  const { user } = useAuth(); // Certifique-se que `user` tem `id` (mapeado de `bdChave`)
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<{
    userProducts: Product[];
    rentalsMadeByYou: RentalItem[];
    yourProductsRentedByOthers: RentalItem[];
    orders: Order[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    // Verifique se o user.id existe antes de fazer a requisição
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chame a sua API Route ou Server Action
      // Se for uma Next.js API Route, o endpoint pode ser `/api/dashboard-data`
      const response = await fetch(`/api/dashboard-data?userId=${user.id}`); // Ajuste para o seu endpoint

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      // Os dados já vêm pré-processados do backend, basta mapear datas e IDs
      const mappedUserProducts: Product[] = data.userProducts.map((p: any) => ({
        id: BigInt(p.bdChave), // Mapeie para BigInt se necessário
        name: p.bdNome,
        description: p.bdDescricao,
        image: p.bdURLIMG,
        price: p.bdPrecoAluguel, // Já é number do backend
        // stock: p.bdEstoque, // Se existir no seu modelo tbFerramentas
      }));

      const mappedRentalsMadeByYou: RentalItem[] = data.rentalsMadeByYou.map((item: any) => ({
        id: BigInt(item.id),
        name: item.name,
        image: item.image,
        price: item.price, // Já é number do backend
        rentalId: BigInt(item.rentalId),
        rentalStatus: item.rentalStatus,
        rentalStartDate: new Date(item.rentalStartDate),
        rentalEndDate: item.rentalEndDate ? new Date(item.rentalEndDate) : undefined,
      }));

      const mappedYourProductsRentedByOthers: RentalItem[] = data.yourProductsRentedByOthers.map((item: any) => ({
        id: BigInt(item.id),
        name: item.name,
        image: item.image,
        price: item.price, // Já é number do backend
        rentalId: BigInt(item.rentalId),
        rentalStatus: item.rentalStatus,
        rentalStartDate: new Date(item.rentalStartDate),
        rentalEndDate: item.rentalEndDate ? new Date(item.rentalEndDate) : undefined,
        clientName: item.clientName,
        clientId: item.clientId,
      }));

      // Se o backend retorna `orders` (para vendas), mapeie-os aqui
      const mappedOrders: Order[] = (data.orders || []).map((order: any) => ({
        id: order.id,
        type: order.type,
        userId: order.userId,
        items: order.items.map((item: any) => ({
          id: BigInt(item.id),
          price: parseFloat(item.price), // Garante que é número
          quantity: item.quantity,
        })),
      }));

      setDashboardData({
        userProducts: mappedUserProducts,
        rentalsMadeByYou: mappedRentalsMadeByYou,
        yourProductsRentedByOthers: mappedYourProductsRentedByOthers,
        orders: mappedOrders,
      });

    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Dependência atualizada para user.id

  useEffect(() => {
    // Redireciona se o usuário não estiver logado
    if (!user) {
      router.push("/");
    } else {
      // Busca os dados do dashboard quando o usuário estiver disponível
      fetchDashboardData();
    }
  }, [user, router, fetchDashboardData]);


  const stats = useMemo(() => {
    if (!dashboardData) return { // Retorna valores padrão para evitar `null` no retorno
      totalRevenue: 0,
      totalRentalRevenue: 0,
      totalSales: 0,
      totalRentals: 0,
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      totalRentalOrders: 0,
    };

    const { userProducts, orders, yourProductsRentedByOthers } = dashboardData;

    // --- Recálculo das estatísticas de vendas (se houver dados de 'orders' de vendas) ---
    // Adapte esta parte se o seu modelo de "vendas" for diferente
    const userSalesOrders = orders.filter(order =>
      order.type === "SALE" && order.items.some(item => userProducts.some(p => p.id === item.id))
    );

    const totalRevenue = userSalesOrders.reduce((sum, order) => {
      const value = order.items
        .filter(item => userProducts.some(p => p.id === item.id))
        .reduce((s, i) => s + i.price * i.quantity, 0)
      return sum + value
    }, 0);

    const totalSales = userSalesOrders.reduce((sum, order) => {
      return sum + order.items
        .filter(item => userProducts.some(p => p.id === item.id))
        .reduce((s, i) => s + i.quantity, 0)
    }, 0);

    // --- Estatísticas de Aluguel (já vêm processadas do backend) ---
    // Suma os preços dos itens alugados DESSES produtos
    const totalRentalRevenue = yourProductsRentedByOthers.reduce((sum, item) => sum + item.price, 0);
    const totalRentals = yourProductsRentedByOthers.length;

    return {
      totalRevenue,
      totalRentalRevenue,
      totalSales,
      totalRentals,
      totalProducts: userProducts.length,
      // Se você tiver um campo de estoque (ex: bdEstoque) em tbFerramentas no Prisma:
      // activeProducts: userProducts.filter(p => (p.stock || 0) > 0).length,
      activeProducts: userProducts.length, // Placeholder se não houver campo de estoque
      totalOrders: userSalesOrders.length + yourProductsRentedByOthers.length, // Soma vendas e aluguéis dos seus produtos
      totalRentalOrders: yourProductsRentedByOthers.length,
    }
  }, [dashboardData]);


  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // --- Renderização condicional ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Se os dados não foram carregados e não há erro nem loading, pode ser que o user.id não exista
  if (!dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Dados do dashboard não disponíveis. Verifique o login.</p>
      </div>
    );
  }

  const { userProducts, rentalsMadeByYou, yourProductsRentedByOthers } = dashboardData;


  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho dos seus produtos</p>
          </div>
          <Button onClick={() => router.push("/meus-produtos")}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita por Vendas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita por Aluguel</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRentalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aluguéis dos Seus Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRentals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com produtos alugados */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Meus Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Produtos que EU aluguei (de outros usuários) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos Alugados por Você
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rentalsMadeByYou.length > 0 ? (
                  rentalsMadeByYou.map((item, index) => (
                    <div key={`${item.id}-${index}-${item.rentalId}`} className="flex items-center gap-4 py-2">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Status: {item.rentalStatus}</p>
                        <p className="text-xs text-muted-foreground">Início: {item.rentalStartDate.toLocaleDateString()}</p>
                        {item.rentalEndDate && <p className="text-xs text-muted-foreground">Fim: {item.rentalEndDate.toLocaleDateString()}</p>}
                      </div>
                      <Badge variant="secondary">Alugado</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-8 text-center">Nenhum produto alugado por você de outros.</div>
                )}
              </CardContent>
            </Card>

            {/* Produtos meus que foram alugados por clientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Seus Produtos Alugados por Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {yourProductsRentedByOthers.length > 0 ? (
                  yourProductsRentedByOthers.map((item, index) => (
                    <div key={`${item.id}-${index}-${item.rentalId}`} className="flex items-center gap-4 py-2">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.clientName && (
                          <p className="text-xs text-muted-foreground">Alugado por: {item.clientName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Status: {item.rentalStatus}</p>
                        <p className="text-xs text-muted-foreground">Início: {item.rentalStartDate.toLocaleDateString()}</p>
                        {item.rentalEndDate && <p className="text-xs text-muted-foreground">Fim: {item.rentalEndDate.toLocaleDateString()}</p>}
                      </div>
                      <Badge variant="secondary">Alugado</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-8 text-center">Nenhum dos seus produtos foi alugado ainda por clientes.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <h2 className="text-2xl font-bold mb-4">Meus Produtos Cadastrados</h2>
            {userProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userProducts.map(product => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <p className="text-lg font-bold">{formatPrice(product.price)} / dia</p> {/* Assumindo preço por dia para aluguel */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">Você ainda não tem produtos cadastrados.</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}