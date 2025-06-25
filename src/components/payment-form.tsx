// apeterecho/src/components/payment-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from 'date-fns/locale';

interface PaymentFormProps {
  totalAmount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
}

export function PaymentForm({ totalAmount, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [cvv, setCvv] = useState("")
  const [installments, setInstallments] = useState("1")
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (paymentMethod === "credit_card") {
      if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
        newErrors.cardNumber = "Número do cartão inválido (16 dígitos)."
      }
      if (!cardName.trim()) {
        newErrors.cardName = "Nome no cartão é obrigatório."
      }
      if (!expiryDate || expiryDate < new Date()) {
        newErrors.expiryDate = "Data de validade inválida ou expirada."
      }
      if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        newErrors.cvv = "CVV inválido (3 ou 4 dígitos)."
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (!validateForm()) {
      setLoading(false)
      return
    }

    console.log("Processando pagamento...", {
      paymentMethod,
      cardNumber: paymentMethod === "credit_card" ? `**** **** **** ${cardNumber.slice(-4)}` : undefined,
      cardName,
      expiryDate,
      cvv: paymentMethod === "credit_card" ? '***' : undefined,
      installments,
      totalAmount,
    })

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const success = Math.random() > 0.1;

      if (success) {
        onPaymentSuccess()
      } else {
        onPaymentError("Ocorreu um erro no processamento do pagamento. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro inesperado no pagamento:", err)
      onPaymentError("Erro inesperado. Por favor, tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  const generateInstallmentOptions = () => {
    const options = []
    const maxInstallments = 12
    for (let i = 1; i <= maxInstallments; i++) {
      const valuePerInstallment = totalAmount / i
      options.push({
        value: String(i),
        label: `${i}x de ${formatPrice(valuePerInstallment)} ${i > 1 ? 'sem juros' : ''}`,
      })
    }
    return options
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Detalhes do Pagamento</CardTitle>
        <CardDescription>
          Selecione seu método de pagamento e insira suas informações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Método de Pagamento</h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Label
              htmlFor="credit_card"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem id="credit_card" value="credit_card" className="sr-only" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-3 h-6 w-6"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              Cartão de Crédito
            </Label>
            <Label
              htmlFor="pix"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem id="pix" value="pix" className="sr-only" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-3 h-6 w-6"
              >
                <path d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                <line x1="8" x2="16" y1="9" y2="9" />
                <path d="M9 13h6" />
                <path d="M12 10v6" />
              </svg>
              PIX
            </Label>
          </RadioGroup>
        </div>

        {paymentMethod === "credit_card" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações do Cartão</h3>
            <div className="grid gap-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="**** **** **** ****"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                required
                className={errors.cardNumber ? "border-red-500" : ""}
              />
              {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                type="text"
                placeholder="Nome Completo"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className={errors.cardName ? "border-red-500" : ""}
              />
              {errors.cardName && <p className="text-sm text-red-500">{errors.cardName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Data de Validade</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!expiryDate && "text-muted-foreground"} ${errors.expiryDate ? "border-red-500" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "MM/yyyy", { locale: ptBR }) : "MM/AAAA"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      locale={ptBR}
                      captionLayout="dropdown"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 10}
                    />
                  </PopoverContent>
                </Popover>
                {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="***"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                  className={errors.cvv ? "border-red-500" : ""}
                />
                {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select value={installments} onValueChange={setInstallments}>
                <SelectTrigger id="installments">
                  <SelectValue placeholder="Selecione o número de parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {generateInstallmentOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {paymentMethod === "pix" && (
          <div className="space-y-4 text-center">
            <h3 className="font-semibold text-lg">Pagamento via PIX</h3>
            <p className="text-muted-foreground">
              Um código PIX (QR Code ou Copia e Cola) será gerado após clicar em "Finalizar Pagamento".
            </p>
            <p className="text-xl font-bold">Valor: {formatPrice(totalAmount)}</p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="billingAddress"
            // FIX: Explicitly type 'checked' parameter
            onCheckedChange={(checked: boolean | "indeterminate") => setBillingAddressSameAsShipping(!!checked)}
            checked={billingAddressSameAsShipping}
          />
          <label
            htmlFor="billingAddress"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Endereço de cobrança igual ao endereço de entrega
          </label>
        </div>

        {!billingAddressSameAsShipping && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Endereço de Cobrança</h3>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" type="text" placeholder="Rua, número" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" type="text" placeholder="Cidade" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" type="text" placeholder="Estado" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zip">CEP</Label>
              <Input id="zip" type="text" placeholder="00000-000" />
            </div>
          </div>
        )}
      </CardContent>
        <Button
          className="w-full"
          onClick={handlePaymentSubmit}
          disabled={loading}
        >
          {loading ? "Processando..." : `Finalizar Pagamento (${formatPrice(totalAmount)})`}
        </Button>
    </Card>
  )
}