"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Package } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useOrders } from "@/context/orders-context"
import { AddressForm } from "@/components/address-form"
import { PaymentForm } from "@/components/payment-form"
import { OrderSummary } from "@/components/order-summary"
import { Badge } from "@/components/ui/badge"

type CheckoutStep = "address" | "payment" | "review"

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

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { cartItems, clearCart, getTotal } = useCart()
  const { createOrder } = useOrders()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address")
  const [address, setAddress] = useState<Address | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (cartItems.length === 0) {
      router.push("/carrinho")
      return
    }
  }, [user, cartItems, router])

  const handleAddressSubmit = (addressData: Address) => {
    setAddress(addressData)
    setCurrentStep("payment")
  }

  const handlePaymentSubmit = (payment: PaymentData) => {
    setPaymentData(payment)
    setCurrentStep("review")
  }

  const handleOrderSubmit = async () => {
    if (!address || !paymentData || !user) return

    setIsProcessing(true)

    try {
      // Simular processamento do pedido
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const order = await createOrder({
        items: cartItems,
        address,
        payment: paymentData,
        total: getTotal(),
      })

      clearCart()
      router.push(`/pedido-confirmado?orderId=${order.id}`)
    } catch (error) {
      console.error("Erro ao processar pedido:", error)
      alert("Erro ao processar pedido. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const steps = [
    { id: "address", title: "Endereço", icon: MapPin, completed: !!address },
    { id: "payment", title: "Pagamento", icon: CreditCard, completed: !!paymentData },
    { id: "review", title: "Revisão", icon: Package, completed: false },
  ]

  if (!user || cartItems.length === 0) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Finalizar Compra</h1>
            <p className="text-muted-foreground">Complete seu pedido em poucos passos</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = step.completed

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === "address" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressForm onSubmit={handleAddressSubmit} />
                </CardContent>
              </Card>
            )}

            {currentStep === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentForm
                    onSubmit={handlePaymentSubmit}
                    onBack={() => setCurrentStep("address")}
                    total={getTotal()}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === "review" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Revisão do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Endereço */}
                  <div>
                    <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p>
                        {address?.street}, {address?.number}
                      </p>
                      {address?.complement && <p>{address.complement}</p>}
                      <p>{address?.neighborhood}</p>
                      <p>
                        {address?.city}, {address?.state} - {address?.zipCode}
                      </p>
                    </div>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentStep("address")}>
                      Alterar endereço
                    </Button>
                  </div>

                  <Separator />

                  {/* Pagamento */}
                  <div>
                    <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {paymentData?.method === "credit" && "Cartão de Crédito"}
                          {paymentData?.method === "debit" && "Cartão de Débito"}
                          {paymentData?.method === "pix" && "PIX"}
                          {paymentData?.method === "boleto" && "Boleto"}
                        </Badge>
                        {paymentData?.cardNumber && (
                          <span className="text-sm text-muted-foreground">
                            **** **** **** {paymentData.cardNumber.slice(-4)}
                          </span>
                        )}
                      </div>
                      {paymentData?.installments && paymentData.installments > 1 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {paymentData.installments}x de R$ {(getTotal() / paymentData.installments).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentStep("payment")}>
                      Alterar pagamento
                    </Button>
                  </div>

                  <Separator />

                  {/* Botão Finalizar */}
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep("payment")} disabled={isProcessing}>
                      Voltar
                    </Button>
                    <Button onClick={handleOrderSubmit} disabled={isProcessing} className="flex-1">
                      {isProcessing ? "Processando..." : "Finalizar Pedido"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
