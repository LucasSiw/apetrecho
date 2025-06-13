"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useProducts } from "@/context/products-context"
import { useAuth } from "@/context/auth-context"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product } from "@/types/product"

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

const categories = [
  "Eletrônicos",
  "Smartphones",
  "Notebooks",
  "Audio",
  "TV & Video",
  "Casa & Jardim",
  "Esportes",
  "Moda",
  "Beleza",
  "Livros",
  "Brinquedos",
  "Ferramentas",
  "Outros",
]

export function ProductForm({ isOpen, onClose, product }: ProductFormProps) {
  const { user } = useAuth()
  const { addProduct, updateProduct } = useProducts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    stock: "1",
    image: "",
    brand: "",
    isNew: true,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        category: product.category || "",
        stock: product.stock?.toString() || "1",
        image: product.image,
        brand: product.brand || "",
        isNew: product.isNew || false,
      })
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "1",
        image: "/placeholder.svg?height=300&width=300",
        brand: "",
        isNew: true,
      })
    }
    setMessage(null)
  }, [product, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return "Nome do produto é obrigatório"
    if (!formData.description.trim()) return "Descrição do produto é obrigatória"
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      return "Preço deve ser um número válido maior que zero"
    if (formData.originalPrice && (isNaN(Number(formData.originalPrice)) || Number(formData.originalPrice) <= 0))
      return "Preço original deve ser um número válido maior que zero"
    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)
      return "Estoque deve ser um número válido não negativo"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setMessage({ type: "error", text: validationError })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const productData: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
        category: formData.category || undefined,
        stock: Number(formData.stock),
        isNew: formData.isNew,
        brand: formData.brand || undefined,
      }

      if (formData.originalPrice) {
        productData.originalPrice = Number(formData.originalPrice)
      }

      let result
      if (product) {
        // Update existing product
        result = await updateProduct({ ...productData, id: product.id })
      } else {
        // Add new product
        result = await addProduct(productData)
      }

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Ocorreu um erro ao salvar o produto",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
        </DialogHeader>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-4">
            {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Marca do produto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o produto"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Preço Original (R$)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0,00 (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Quantidade"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isNew"
              checked={formData.isNew}
              onCheckedChange={(checked) => handleSwitchChange("isNew", checked)}
            />
            <Label htmlFor="isNew">Marcar como produto novo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : product ? (
                "Atualizar Produto"
              ) : (
                "Adicionar Produto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
