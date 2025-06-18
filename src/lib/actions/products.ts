"use server"

import { prisma } from "@/lib/database"
import { revalidatePath } from "next/cache"
import type { Product } from "@/types/product"

export interface ProductInput {
  name: string
  description: string
  price: number
  originalPrice?: number
  category?: string
  stock: number
  image: string
  brand?: string
  isNew: boolean
  userId: string
}

export async function createProduct(data: ProductInput) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        stock: data.stock,
        image: data.image,
        brand: data.brand,
        isNew: data.isNew,
        userId: data.userId,
      },
    })

    revalidatePath("/meus-produtos")
    revalidatePath("/dashboard")

    return {
      success: true,
      productId: product.id,
      message: "Produto criado com sucesso!",
    }
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return {
      success: false,
      message: "Erro ao criar produto. Tente novamente.",
    }
  }
}

export async function updateProduct(productId: string, data: Partial<ProductInput>) {
  try {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice
    if (data.category !== undefined) updateData.category = data.category
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.image !== undefined) updateData.image = data.image
    if (data.brand !== undefined) updateData.brand = data.brand
    if (data.isNew !== undefined) updateData.isNew = data.isNew

    await prisma.product.update({
      where: { id: productId },
      data: updateData,
    })

    revalidatePath("/meus-produtos")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Produto atualizado com sucesso!",
    }
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return {
      success: false,
      message: "Erro ao atualizar produto. Tente novamente.",
    }
  }
}

export async function deleteProduct(productId: string, userId: string) {
  try {
    await prisma.product.delete({
      where: {
        id: productId,
        userId: userId, // Garantir que só o dono pode deletar
      },
    })

    revalidatePath("/meus-produtos")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Produto excluído com sucesso!",
    }
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return {
      success: false,
      message: "Erro ao excluir produto. Tente novamente.",
    }
  }
}

export async function getUserProducts(userId: string): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return products.map((product: { id: any; name: any; description: any; price: { toNumber: () => number }; originalPrice: { toNumber: () => any }; category: any; stock: any; image: any; brand: any; isNew: any }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      originalPrice: product.originalPrice?.toNumber(),
      category: product.category,
      stock: product.stock,
      image: product.image,
      brand: product.brand,
      isNew: product.isNew,
      rating: 0,
      reviewCount: 0,
      sku: `SKU-${product.id}`,
      installments: {
        count: 12,
        value: Math.round((product.price.toNumber() / 12) * 100) / 100,
      },
    }))
  } catch (error) {
    console.error("Erro ao buscar produtos do usuário:", error)
    return []
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return null
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      originalPrice: product.originalPrice?.toNumber(),
      category: product.category,
      stock: product.stock,
      image: product.image,
      brand: product.brand,
      isNew: product.isNew,
      rating: 0,
      reviewCount: 0,
      sku: `SKU-${product.id}`,
      installments: {
        count: 12,
        value: Math.round((product.price.toNumber() / 12) * 100) / 100,
      },
    }
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
    })

    return products.map((product: { id: any; name: any; description: any; price: { toNumber: () => number }; originalPrice: { toNumber: () => any }; category: any; stock: any; image: any; brand: any; isNew: any }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      originalPrice: product.originalPrice?.toNumber(),
      category: product.category,
      stock: product.stock,
      image: product.image,
      brand: product.brand,
      isNew: product.isNew,
      rating: Math.random() * 2 + 3, // Rating simulado entre 3-5
      reviewCount: Math.floor(Math.random() * 100) + 10, // Reviews simuladas
      sku: `SKU-${product.id}`,
      installments: {
        count: 12,
        value: Math.round((product.price.toNumber() / 12) * 100) / 100,
      },
    }))
  } catch (error) {
    console.error("Erro ao buscar todos os produtos:", error)
    return []
  }
}

export async function searchProducts(searchTerm: string, category?: string): Promise<Product[]> {
  try {
    const whereCondition: any = {
      stock: { gt: 0 },
    }

    if (searchTerm) {
      whereCondition.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    if (category && category !== "Todos") {
      whereCondition.category = category
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
    })

    return products.map((product: { id: any; name: any; description: any; price: { toNumber: () => number }; originalPrice: { toNumber: () => any }; category: any; stock: any; image: any; brand: any; isNew: any }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      originalPrice: product.originalPrice?.toNumber(),
      category: product.category,
      stock: product.stock,
      image: product.image,
      brand: product.brand,
      isNew: product.isNew,
      rating: Math.random() * 2 + 3,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      sku: `SKU-${product.id}`,
      installments: {
        count: 12,
        value: Math.round((product.price.toNumber() / 12) * 100) / 100,
      },
    }))
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        category,
        stock: { gt: 0 },
      },
      orderBy: { createdAt: "desc" },
    })

    return products.map((product: { id: any; name: any; description: any; price: { toNumber: () => number }; originalPrice: { toNumber: () => any }; category: any; stock: any; image: any; brand: any; isNew: any }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      originalPrice: product.originalPrice?.toNumber(),
      category: product.category,
      stock: product.stock,
      image: product.image,
      brand: product.brand,
      isNew: product.isNew,
      rating: Math.random() * 2 + 3,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      sku: `SKU-${product.id}`,
      installments: {
        count: 12,
        value: Math.round((product.price.toNumber() / 12) * 100) / 100,
      },
    }))
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error)
    return []
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        isNew: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    })

    return products.map((product: { id: any; name: any; description: any; price: { toNumber: () => number }; originalPrice: { toNumber: () => any }; category: any; stock: any; image: any; brand: any; isNew: any }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      originalPrice: product.originalPrice?.toNumber(),
      category: product.category,
      stock: product.stock,
      image: product.image,
      brand: product.brand,
      isNew: product.isNew,
      rating: Math.random() * 2 + 3,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      sku: `SKU-${product.id}`,
      installments: {
        count: 12,
        value: Math.round((product.price.toNumber() / 12) * 100) / 100,
      },
    }))
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error)
    return []
  }
}
