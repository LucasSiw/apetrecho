"use server"

import { prisma } from "@/lib/database"
import { revalidatePath } from "next/cache"
import type { Product } from "@/types/product"
import { Decimal } from "@prisma/client/runtime/library"
import { convertPrismaProductToProduct, type PrismaProduct } from "@/types/prisma"

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
    console.log("Criando produto com dados:", data)

    const product = await prisma.tbferramentas.create({
      data: {
        bdNome: data.name,
        bdDescricao: data.description,
        bdCategoria: data.category || "Geral",
        bdURLIMG: data.image,
        bdPrecoAluguel: new Decimal(data.price.toString()),
        bdChaveCli: Number.parseInt(data.userId) || 1,
        bdEstado: "dispon_vel",
        bdAtivo: true,
      },
    })

    revalidatePath("/meus-produtos")
    revalidatePath("/dashboard")

    return {
      success: true,
      productId: product.bdChave.toString(),
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

    if (data.name !== undefined) updateData.bdNome = data.name
    if (data.description !== undefined) updateData.bdDescricao = data.description
    if (data.price !== undefined) updateData.bdPrecoAluguel = new Decimal(data.price.toString())
    if (data.category !== undefined) updateData.bdCategoria = data.category
    if (data.image !== undefined) updateData.bdURLIMG = data.image

    await prisma.tbferramentas.update({
      where: { bdChave: BigInt(productId) },
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
    await prisma.tbferramentas.update({
      where: {
        bdChave: BigInt(productId),
        bdChaveCli: Number.parseInt(userId),
      },
      data: {
        bdAtivo: false,
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
    const products = await prisma.tbferramentas.findMany({
      where: {
        bdChaveCli: Number.parseInt(userId),
        bdAtivo: true,
      },
      orderBy: { bdDTCADASTRO: "desc" },
    })

    return products.map((product: PrismaProduct) => convertPrismaProductToProduct(product as PrismaProduct))
  } catch (error) {
    console.error("Erro ao buscar produtos do usuário:", error)
    return []
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const product = await prisma.tbferramentas.findUnique({
      where: { bdChave: BigInt(productId) },
    })

    if (!product || !product.bdAtivo) {
      return null
    }

    return convertPrismaProductToProduct(product as PrismaProduct)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await prisma.tbferramentas.findMany({
      where: {
        bdAtivo: true,
        bdEstado: "dispon_vel",
      },
      orderBy: { bdDTCADASTRO: "desc" },
    })

    return products.map((product: PrismaProduct) => convertPrismaProductToProduct(product as PrismaProduct))
  } catch (error) {
    console.error("Erro ao buscar todos os produtos:", error)
    return []
  }
}

export async function searchProducts(searchTerm: string, category?: string): Promise<Product[]> {
  try {
    const whereCondition: any = {
      bdAtivo: true,
      bdEstado: "dispon_vel",
    }

    if (searchTerm) {
      whereCondition.OR = [
        { bdNome: { contains: searchTerm, mode: "insensitive" } },
        { bdDescricao: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    if (category && category !== "Todos") {
      whereCondition.bdCategoria = category
    }

    const products = await prisma.tbferramentas.findMany({
      where: whereCondition,
      orderBy: { bdDTCADASTRO: "desc" },
    })

    return products.map((product: PrismaProduct) => convertPrismaProductToProduct(product as PrismaProduct))
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await prisma.tbferramentas.findMany({
      where: {
        bdCategoria: category,
        bdAtivo: true,
        bdEstado: "dispon_vel",
      },
      orderBy: { bdDTCADASTRO: "desc" },
    })

    return products.map((product: PrismaProduct) => convertPrismaProductToProduct(product as PrismaProduct))
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error)
    return []
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.tbferramentas.findMany({
      where: {
        bdAtivo: true,
        bdEstado: "dispon_vel",
      },
      orderBy: { bdDTCADASTRO: "desc" },
      take: 8,
    })

    return products.map((product: PrismaProduct) => {
      const converted = convertPrismaProductToProduct(product as PrismaProduct)
      return {
        ...converted,
        isNew: true, // Produtos em destaque são marcados como novos
      }
    })
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error)
    return []
  }
}

// Funções específicas para o sistema de aluguel
export async function createRental(clientId: number, toolId: string, totalValue: number) {
  try {
    const rental = await prisma.tbalugueis.create({
      data: {
        bdChaveCli: clientId,
        bdChaveFer: Number.parseInt(toolId),
        bdVlrTotal: new Decimal(totalValue.toString()),
        bdStatus: "ativo",
      },
    })

    // Atualizar status da ferramenta para alugada
    await prisma.tbferramentas.update({
      where: { bdChave: BigInt(toolId) },
      data: { bdEstado: "alugada" },
    })

    return {
      success: true,
      rentalId: rental.bdChave.toString(),
      message: "Aluguel criado com sucesso!",
    }
  } catch (error) {
    console.error("Erro ao criar aluguel:", error)
    return {
      success: false,
      message: "Erro ao criar aluguel. Tente novamente.",
    }
  }
}

export async function finishRental(rentalId: string) {
  try {
    const rental = await prisma.tbalugueis.update({
      where: { bdChave: BigInt(rentalId) },
      data: {
        bdStatus: "finalizado",
        bdDTFIM: new Date(),
      },
    })

    // Retornar ferramenta para disponível
    if (rental.bdChaveFer) {
      await prisma.tbferramentas.update({
        where: { bdChave: BigInt(rental.bdChaveFer) },
        data: { bdEstado: "dispon_vel" },
      })
    }

    return {
      success: true,
      message: "Aluguel finalizado com sucesso!",
    }
  } catch (error) {
    console.error("Erro ao finalizar aluguel:", error)
    return {
      success: false,
      message: "Erro ao finalizar aluguel. Tente novamente.",
    }
  }
}

// Função para buscar aluguéis ativos de um cliente
export async function getActiveRentals(clientId: string) {
  try {
    const rentals = await prisma.tbalugueis.findMany({
      where: {
        bdChaveCli: Number.parseInt(clientId),
        bdStatus: "ativo",
      },
      orderBy: { bdDTINICIO: "desc" },
    })

    return {
      success: true,
      rentals: rentals.map((rental: { bdChave: { toString: () => any }; bdChaveFer: { toString: () => any }; bdDTINICIO: any; bdVlrTotal: { toNumber: () => any }; bdStatus: any }) => ({
        id: rental.bdChave.toString(),
        toolId: rental.bdChaveFer?.toString(),
        startDate: rental.bdDTINICIO,
        totalValue: rental.bdVlrTotal?.toNumber(),
        status: rental.bdStatus,
      })),
    }
  } catch (error) {
    console.error("Erro ao buscar aluguéis ativos:", error)
    return {
      success: false,
      rentals: [],
    }
  }
}
