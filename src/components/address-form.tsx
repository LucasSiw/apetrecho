"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

interface AddressFormProps {
  onSubmit: (address: Address) => void
}

const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

export function AddressForm({ onSubmit }: AddressFormProps) {
  const [formData, setFormData] = useState<Address>({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const handleChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleZipCodeChange = async (zipCode: string) => {
    // Remove caracteres não numéricos
    const cleanZipCode = zipCode.replace(/\D/g, "")

    // Formatar CEP
    const formattedZipCode = cleanZipCode.replace(/(\d{5})(\d{3})/, "$1-$2")
    handleChange("zipCode", formattedZipCode)

    // Buscar endereço via CEP (simulado)
    if (cleanZipCode.length === 8) {
      try {
        // Aqui você integraria com uma API de CEP como ViaCEP
        // Por enquanto, vamos simular
        const mockAddress = {
          street: "Rua das Flores",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
        }

        setFormData((prev) => ({
          ...prev,
          street: mockAddress.street,
          neighborhood: mockAddress.neighborhood,
          city: mockAddress.city,
          state: mockAddress.state,
        }))
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (
      !formData.street ||
      !formData.number ||
      !formData.neighborhood ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="zipCode">CEP *</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleZipCodeChange(e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Label htmlFor="street">Rua *</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="Nome da rua"
            required
          />
        </div>
        <div className="md:col-span-1">
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => handleChange("number", e.target.value)}
            placeholder="123"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="complement">Complemento</Label>
        <Input
          id="complement"
          value={formData.complement}
          onChange={(e) => handleChange("complement", e.target.value)}
          placeholder="Apartamento, bloco, etc."
        />
      </div>

      <div>
        <Label htmlFor="neighborhood">Bairro *</Label>
        <Input
          id="neighborhood"
          value={formData.neighborhood}
          onChange={(e) => handleChange("neighborhood", e.target.value)}
          placeholder="Nome do bairro"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Nome da cidade"
            required
          />
        </div>
        <div className="md:col-span-1">
          <Label htmlFor="state">Estado *</Label>
          <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {brazilianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Continuar para Pagamento</Button>
      </div>
    </form>
  )
}
