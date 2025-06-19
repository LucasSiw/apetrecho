export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[] // Array de imagens
  category?: string
  rating?: number
  reviewCount?: number
  stock?: number
  isNew?: boolean
  installments?: {
    count: number
    value: number
  }
  specifications?: string[]
  brand?: string
  sku?: string
  condition?: string // Nova, Usada, Seminova
  owner?: {
    // Informações do proprietário
    name: string
    email: string
    phone?: string | null
  }
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  category: string
  images: string[]
  condition: string
  observations: string
}
