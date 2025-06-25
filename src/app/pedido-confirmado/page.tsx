import { CheckCircle2, Package, Truck, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PedidoConfirmadoPage() {

  const orderId = "XPTO123456"
  const estimatedDelivery = "3-5 dias úteis"

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-12 md:py-16 lg:py-20 flex items-center justify-center">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader className="flex flex-col items-center justify-center space-y-4 pt-8 pb-4">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
            <CardTitle className="text-4xl font-bold tracking-tight">
              Pedido Confirmado!
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Sua compra foi realizada com sucesso.
            </p>
          </CardHeader>
          <CardContent className="space-y-8 pb-8">
            <div className="bg-muted p-6 rounded-lg text-left">
              <h3 className="text-xl font-semibold mb-3">Detalhes do Pedido</h3>
              <div className="grid gap-2 text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Número do Pedido:</span>
                  <span className="text-foreground font-semibold">{orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Data do Pedido:</span>
                  <span className="text-foreground">{new Date().toLocaleDateString("pt-BR", {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Método de Pagamento:</span>
                  <span className="text-foreground">Cartão de Crédito/PIX (Simulado)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3 p-4 border rounded-lg shadow-sm">
                <Package className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Seu Pedido está Sendo Preparado</h4>
                  <p className="text-muted-foreground text-sm">
                    Estamos processando sua solicitação e preparando os itens para envio.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border rounded-lg shadow-sm">
                <Truck className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Previsão de Entrega</h4>
                  <p className="text-muted-foreground text-sm">
                    A entrega estimada é de **{estimatedDelivery}**. Você receberá atualizações.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-base mt-4 flex items-center justify-center gap-2">
              <Smile className="h-5 w-5 text-yellow-500" />
              Agradecemos a sua preferência e confiança na Apetrecho!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg">
                <Link href="/meus-pedidos">Ver Meus Pedidos</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/">Continuar Comprando</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}