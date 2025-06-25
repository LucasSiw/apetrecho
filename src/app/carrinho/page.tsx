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

// Importar o novo componente de formulário de pagamento
import { PaymentForm } from "@/components/payment-form"
import { useRouter } from "next/navigation" // Adicione para redirecionar após o pagamento

// Componente CartItems (sem alterações significativas, apenas para referência)
export function CartItems() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false) // Novo estado para controlar o formulário de pagamento
  const router = useRouter() // Para redirecionamento

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
    // Se o usuário está logado, mostra o formulário de pagamento
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = () => {
    alert("Pagamento realizado com sucesso! Seu pedido foi confirmado.")
    clearCart() // Limpa o carrinho após o sucesso
    router.push("/pedido-confirmado") // Redireciona para uma página de confirmação de pedido
  }

  const handlePaymentError = (message: string) => {
    alert(`Erro no pagamento: ${message}`)
    // Poderia adicionar mais lógica aqui, como permitir que o usuário tente novamente
  }

  if (cartItems.length === 0 && !showPaymentForm) { // Se o carrinho estiver vazio e não estiver no formulário de pagamento
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Seu carrinho está vazio</h2>
        <p className="mt-2 text-muted-foreground">Adicione alguns produtos para começar a comprar.</p>
        <Button className="mt-4" asChild>
          <a href="/">Continuar Comprando</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {!showPaymentForm ? ( // Renderiza os itens do carrinho ou o formulário de pagamento
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
                Finalizar Compra
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/">Continuar Comprando</a>
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        // Se showPaymentForm for true, exibe o formulário de pagamento
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

// O componente CartPage continua chamando CartItems
export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Seu Carrinho</h1>
            <p className="text-muted-foreground">Revise seus itens e prossiga para o checkout quando estiver pronto.</p>
            <CartItems /> {/* CartItems agora gerencia a exibição do PaymentForm */}
          </div>
        </section>
      </main>
    </div>
  )
}