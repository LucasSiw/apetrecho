export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category?: string
  rating?: number
  reviewCount?: number
  stock?: number
  isNew?: boolean
  installments?: {
    count: number
    value: number
  }
  specifications?: Record<string, string>
  brand?: string
  sku?: string
}
