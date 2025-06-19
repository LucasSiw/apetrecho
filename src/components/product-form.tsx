"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/context/products-context"
import { useAuth } from "@/context/auth-context"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"
import type { Product } from "@/types/product"

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

const categories = [
  "Ferramentas Elétricas",
  "Ferramentas Manuais",
  "Equipamentos de Jardim",
  "Equipamentos de Construção",
  "Equipamentos de Pintura",
  "Equipamentos de Limpeza",
  "Equipamentos de Segurança",
  "Máquinas Industriais",
  "Outros",
]

const conditions = ["Nova", "Seminova", "Usada - Excelente", "Usada - Boa", "Usada - Regular"]

export function ProductForm({ isOpen, onClose, product }: ProductFormProps) {
  const { user } = useAuth()
  const { addProduct, updateProduct } = useProducts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    condition: "Usada - Boa",
    observations: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category || "",
        images: product.images || [product.image],
        condition: product.condition || "Usada - Boa",
        observations: product.specifications?.join("\n") || "",
      })
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        images: [],
        condition: "Usada - Boa",
        observations: "",
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

  const handleImagesChange = (images: string[]) => {
    setFormData((prev) => ({ ...prev, images }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return "Nome do produto é obrigatório"
    if (!formData.description.trim()) return "Descrição do produto é obrigatória"
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      return "Preço deve ser um número válido maior que zero"
    if (!formData.category) return "Categoria é obrigatória"
    if (formData.images.length === 0) return "Adicione pelo menos uma foto do produto"
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
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        images: formData.images,
        condition: formData.condition,
        observations: formData.observations,
        stock: 1, // Sempre disponível quando cadastrado
        isNew: false,
        brand: "Particular",
        image: formData.images[0], // Primeira imagem como principal
      }

      let result
      if (product) {
        // Update existing product
        result = await updateProduct(product.id, productData)
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Cadastrar Novo Produto"}</DialogTitle>
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
                placeholder="Ex: Furadeira Bosch 650W"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva detalhadamente o produto, suas características e funcionalidades"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Aluguel (R$/dia) *</Label>
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
              <Label htmlFor="condition">Condição do Produto</Label>
              <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload de Imagens */}
          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={5}
            className="space-y-2"
          />

          <div className="space-y-2">
            <Label htmlFor="observations">Observações Adicionais</Label>
            <Textarea
              id="observations"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Informações extras sobre o produto, cuidados especiais, acessórios inclusos, etc."
              rows={3}
            />
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
                "Cadastrar Produto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
