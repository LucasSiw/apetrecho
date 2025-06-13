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
    const query = `
      INSERT INTO products (
        name, description, price, original_price, category, 
        stock, image, brand, is_new, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const params = [
      data.name,
      data.description,
      data.price,
      data.originalPrice || null,
      data.category || null,
      data.stock,
      data.image,
      data.brand || null,
      data.isNew ? 1 : 0,
      data.userId,
    ]

    const result = (await executeQuery(query, params)) as any

    revalidatePath("/meus-produtos")

    return {
      success: true,
      productId: result.insertId,
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
    const updateFields: string[] = []
    const params: any[] = []

    if (data.name !== undefined) {
      updateFields.push("name = ?")
      params.push(data.name)
    }
    if (data.description !== undefined) {
      updateFields.push("description = ?")
      params.push(data.description)
    }
    if (data.price !== undefined) {
      updateFields.push("price = ?")
      params.push(data.price)
    }
    if (data.originalPrice !== undefined) {
      updateFields.push("original_price = ?")
      params.push(data.originalPrice)
    }
    if (data.category !== undefined) {
      updateFields.push("category = ?")
      params.push(data.category)
    }
    if (data.stock !== undefined) {
      updateFields.push("stock = ?")
      params.push(data.stock)
    }
    if (data.image !== undefined) {
      updateFields.push("image = ?")
      params.push(data.image)
    }
    if (data.brand !== undefined) {
      updateFields.push("brand = ?")
      params.push(data.brand)
    }
    if (data.isNew !== undefined) {
      updateFields.push("is_new = ?")
      params.push(data.isNew ? 1 : 0)
    }

    updateFields.push("updated_at = NOW()")
    params.push(productId)

    const query = `
      UPDATE products 
      SET ${updateFields.join(", ")} 
      WHERE id = ?
    `

    await executeQuery(query, params)

    revalidatePath("/meus-produtos")

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
    const query = "DELETE FROM products WHERE id = ? AND user_id = ?"
    await executeQuery(query, [productId, userId])

    revalidatePath("/meus-produtos")

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
    const query = `
      SELECT 
        id,
        name,
        description,
        price,
        original_price as originalPrice,
        category,
        stock,
        image,
        brand,
        is_new as isNew,
        created_at as createdAt,
        updated_at as updatedAt
      FROM products 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `

    const results = (await executeQuery(query, [userId])) as any[]

    return results.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: Number.parseFloat(row.price),
      originalPrice: row.originalPrice ? Number.parseFloat(row.originalPrice) : undefined,
      category: row.category,
      stock: row.stock,
      image: row.image,
      brand: row.brand,
      isNew: Boolean(row.isNew),
      rating: 0,
      reviewCount: 0,
      sku: `SKU-${row.id}`,
      installments: {
        count: 12,
        value: Math.round((Number.parseFloat(row.price) / 12) * 100) / 100,
      },
    }))
  } catch (error) {
    console.error("Erro ao buscar produtos do usuário:", error)
    return []
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const query = `
      SELECT 
        id,
        name,
        description,
        price,
        original_price as originalPrice,
        category,
        stock,
        image,
        brand,
        is_new as isNew,
        user_id as userId
      FROM products 
      WHERE id = ?
    `

    const results = (await executeQuery(query, [productId])) as any[]

    if (results.length === 0) {
      return null
    }

    const row = results[0]
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: Number.parseFloat(row.price),
      originalPrice: row.originalPrice ? Number.parseFloat(row.originalPrice) : undefined,
      category: row.category,
      stock: row.stock,
      image: row.image,
      brand: row.brand,
      isNew: Boolean(row.isNew),
      rating: 0,
      reviewCount: 0,
      sku: `SKU-${row.id}`,
      installments: {
        count: 12,
        value: Math.round((Number.parseFloat(row.price) / 12) * 100) / 100,
      },
    }
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }
}
function executeQuery(query: string, params: (string | number | null)[]): any {
    throw new Error("Function not implemented.")
}

