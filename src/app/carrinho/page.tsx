// apeterecho/src/components/cart-items.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { LoginModal } from "@/components/login-modal"
import { RegisterModal } from "@/components/register-modal"
import { PaymentForm } from "@/components/payment-form"
import { useRouter } from "next/navigation"
import { createRental, getUserRentals } from "@/lib/actions/orders" // Importar a nova Server Action
import { useToast } from "@/app/hooks/use-toast" // Assumindo que você tem este hook

export function CartItems() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const router = useRouter()
  const { toast } = useToast() // Inicializa o toast

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = async () => {
    if (!user || !user.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não logado ou ID de usuário ausente.",
        variant: "destructive",
      });
      return;
    }

    // Processar cada item do carrinho como um aluguel
    for (const item of cartItems) {
      try {
        const rentalData = {
          clienteId: Number(user.id), // O ID do cliente que está alugando (convertido para number)
          ferramentaId: BigInt(item.id), // O ID da ferramenta, convertido para BigInt
          dataInicio: new Date(), // Data/hora atual do aluguel
          // dataFim: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // Exemplo: alugar por 7 dias
          // Se seu sistema tiver duração de aluguel flexível, capture isso da UI
          // Ou defina uma duração padrão. Se não tiver dataFim, não inclua no objeto.
          valorTotal: item.price * item.quantity, // Preço total do item
          statusInicial: "confirmado", // Status inicial do aluguel
        };

        const result = await createRental(rentalData);

        if (result.success) {
          console.log(`Aluguel para ${item.name} registrado com sucesso!`);
          // Opcional: mostrar um toast para cada item ou um único toast no final
        } else {
          console.error(`Falha ao registrar aluguel para ${item.name}: ${result.message}`);
          toast({
            title: "Erro ao registrar aluguel",
            description: `Não foi possível registrar o aluguel para ${item.name}: ${result.message}`,
            variant: "destructive",
          });
          // Se um item falhar, você pode decidir se continua ou para o processo
          // Por enquanto, vamos continuar, mas reportar o erro.
        }
      } catch (error) {
        console.error(`Erro inesperado ao registrar aluguel para ${item.name}:`, error);
        toast({
          title: "Erro inesperado",
          description: `Ocorreu um erro inesperado ao registrar o aluguel para ${item.name}.`,
          variant: "destructive",
        });
      }
    }

    // Após tentar registrar todos os aluguéis:
    toast({
      title: "Pagamento realizado!",
      description: "Seu pedido foi confirmado e o(s) aluguel(is) registrado(s).",
      variant: "default",
    });
    clearCart(); // Limpa o carrinho após o sucesso
    router.push("/pedido-confirmado"); // Redireciona para a página de confirmação
  };

  const handlePaymentError = (message: string) => {
    toast({
      title: "Erro no pagamento",
      description: `Ocorreu um erro ao processar seu pagamento: ${message}`,
      variant: "destructive",
    });
  };

  if (cartItems.length === 0 && !showPaymentForm) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Seu carrinho está vazio</h2>
        <p className="mt-2 text-muted-foreground">Adicione alguns produtos para começar a alugar.</p>
        <Button className="mt-4" asChild>
          <a href="/">Continuar alugando</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {!showPaymentForm ? (
        <>
          <div className="grid gap-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-md">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="h-8 w-12 rounded-none text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>Calculado no checkout</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={handleCheckout}>
                Finalizar aluguel
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/">Continuar alugando</a>
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <PaymentForm
          totalAmount={calculateTotal()}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
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
    </div>
  )
}

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Seu Carrinho</h1>
            <p className="text-muted-foreground">Revise seus itens e prossiga para o checkout quando estiver pronto.</p>
            <CartItems />
          </div>
        </section>
      </main>
    </div>
  )
}