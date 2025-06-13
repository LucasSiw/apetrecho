"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Smartphone, FileText, ArrowLeft } from "lucide-react"

interface PaymentData {
  method: "credit" | "debit" | "pix" | "boleto"
  cardNumber?: string
  cardName?: string
  cardExpiry?: string
  cardCvv?: string
  installments?: number
}

interface PaymentFormProps {
  onSubmit: (payment: PaymentData) => void
  onBack: () => void
  total: number
}

export function PaymentForm({ onSubmit, onBack, total }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "pix" | "boleto">("credit")
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    installments: 1,
  })

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "credit" || paymentMethod === "debit") {
      if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
        alert("Por favor, preencha todos os dados do cartão.")
        return
      }
    }

    const paymentData: PaymentData = {
      method: paymentMethod,
      ...(paymentMethod === "credit" || paymentMethod === "debit"
        ? {
            cardNumber: formData.cardNumber.replace(/\s/g, ""),
            cardName: formData.cardName,
            cardExpiry: formData.cardExpiry,
            cardCvv: formData.cardCvv,
            installments: formData.installments,
          }
        : {}),
    }

    onSubmit(paymentData)
  }

  const installmentOptions = []
  for (let i = 1; i <= 12; i++) {
    const installmentValue = total / i
    const label =
      i === 1
        ? `À vista - R$ ${total.toFixed(2)}`
        : `${i}x de R$ ${installmentValue.toFixed(2)} ${i <= 6 ? "sem juros" : "com juros"}`
    installmentOptions.push({ value: i, label })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Forma de Pagamento</Label>
        <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} className="mt-3">
          <div className="space-y-3">
            <Card
              className={`cursor-pointer transition-colors ${paymentMethod === "credit" ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="credit" id="credit" />
                  <CreditCard className="h-5 w-5" />
                  <Label htmlFor="credit" className="cursor-pointer">
                    Cartão de Crédito
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-colors ${paymentMethod === "debit" ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="debit" id="debit" />
                  <CreditCard className="h-5 w-5" />
                  <Label htmlFor="debit" className="cursor-pointer">
                    Cartão de Débito
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-colors ${paymentMethod === "pix" ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="pix" id="pix" />
                  <Smartphone className="h-5 w-5" />
                  <Label htmlFor="pix" className="cursor-pointer">
                    PIX
                  </Label>
                  <span className="text-sm text-green-600 font-medium">5% de desconto</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-colors ${paymentMethod === "boleto" ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="boleto" id="boleto" />
                  <FileText className="h-5 w-5" />
                  <Label htmlFor="boleto" className="cursor-pointer">
                    Boleto Bancário
                  </Label>
                  <span className="text-sm text-blue-600 font-medium">3% de desconto</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>
      </div>

      {(paymentMethod === "credit" || paymentMethod === "debit") && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Número do Cartão *</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => handleChange("cardNumber", formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardName">Nome no Cartão *</Label>
            <Input
              id="cardName"
              value={formData.cardName}
              onChange={(e) => handleChange("cardName", e.target.value.toUpperCase())}
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardExpiry">Validade *</Label>
              <Input
                id="cardExpiry"
                value={formData.cardExpiry}
                onChange={(e) => handleChange("cardExpiry", formatExpiry(e.target.value))}
                placeholder="MM/AA"
                maxLength={5}
                required
              />
            </div>
            <div>
              <Label htmlFor="cardCvv">CVV *</Label>
              <Input
                id="cardCvv"
                value={formData.cardCvv}
                onChange={(e) => handleChange("cardCvv", e.target.value.replace(/\D/g, ""))}
                placeholder="000"
                maxLength={4}
                required
              />
            </div>
          </div>

          {paymentMethod === "credit" && (
            <div>
              <Label htmlFor="installments">Parcelamento</Label>
              <Select
                value={formData.installments.toString()}
                onValueChange={(value) => handleChange("installments", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {installmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {paymentMethod === "pix" && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Pagamento via PIX</h3>
          <p className="text-sm text-blue-800">
            Após confirmar o pedido, você receberá o código PIX para pagamento. O pagamento deve ser realizado em até 30
            minutos.
          </p>
        </div>
      )}

      {paymentMethod === "boleto" && (
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-900 mb-2">Pagamento via Boleto</h3>
          <p className="text-sm text-orange-800">
            O boleto será gerado após a confirmação do pedido. O prazo de vencimento é de 3 dias úteis.
          </p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1">
          Continuar para Revisão
        </Button>
      </div>
    </form>
  )
}
