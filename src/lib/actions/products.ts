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
  images?: string[]
  brand?: string
  isNew: boolean
  userId: string
  condition?: string
  observations?: string
}

export async function createProduct(data: ProductInput) {
  try {
    console.log("Criando produto com dados:", data)

    const product = await prisma.tbFerramentas.create({
      data: {
        bdNome: data.name,
        bdDescricao: data.description,
        bdCategoria: data.category || "Geral",
        bdURLIMG: data.image, // Manter compatibilidade
        bdPrecoAluguel: new Decimal(data.price.toString()),
        bdChaveCli: Number.parseInt(data.userId),
        bdEstado: data.stock > 0 ? "disponível" : "manutenção",
        bdAtivo: true,
        bdDTCADASTRO: new Date(),
        // bdCondicao: data.condition || "Usada", // Removed: not a valid field in schema
        bdObservacoes: data.observations || null,
      },
    })

    console.log("Produto criado no banco:", product)

    revalidatePath("/meus-produtos")
    revalidatePath("/dashboard")
    revalidatePath("/")

    return {
      success: true,
      productId: product.bdChave.toString(),
      message: "Produto cadastrado com sucesso!",
    }
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return {
      success: false,
      message: "Erro ao cadastrar produto. Tente novamente.",
    }
  }
}

export async function updateProduct(productId: string, data: Partial<ProductInput>) {
  try {
    console.log("Atualizando produto:", productId, "com dados:", data)

    const updateData: any = {}

    if (data.name !== undefined) updateData.bdNome = data.name
    if (data.description !== undefined) updateData.bdDescricao = data.description
    if (data.price !== undefined) updateData.bdPrecoAluguel = new Decimal(data.price.toString())
    if (data.category !== undefined) updateData.bdCategoria = data.category
    if (data.image !== undefined) updateData.bdURLIMG = data.image
    if (data.images !== undefined) updateData.bdImagens = JSON.stringify(data.images)
    if (data.stock !== undefined) updateData.bdEstado = data.stock > 0 ? "disponível" : "manutenção"
    if (data.condition !== undefined) updateData.bdCondicao = data.condition
    if (data.observations !== undefined) updateData.bdObservacoes = data.observations

    const updatedProduct = await prisma.tbFerramentas.update({
      where: { bdChave: BigInt(productId) },
      data: updateData,
    })

    console.log("Produto atualizado:", updatedProduct)

    revalidatePath("/meus-produtos")
    revalidatePath("/dashboard")
    revalidatePath("/")

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
    console.log("Excluindo produto:", productId, "do usuário:", userId)

    const deletedProduct = await prisma.tbFerramentas.update({
      where: {
        bdChave: BigInt(productId),
        bdChaveCli: Number.parseInt(userId),
      },
      data: {
        bdAtivo: false,
      },
    })

    console.log("Produto excluído:", deletedProduct)

    revalidatePath("/meus-produtos")
    revalidatePath("/dashboard")
    revalidatePath("/")

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
    console.log("Buscando produtos do usuário:", userId)

    const products = await prisma.tbFerramentas.findMany({
      where: {
        bdChaveCli: Number.parseInt(userId),
        bdAtivo: true,
      },
      include: {
        cliente: true,
      },
      orderBy: { bdDTCADASTRO: "desc" },
    })

    console.log("Produtos encontrados no banco:", products.length)

    const convertedProducts = products.map((product) => {
      const converted = convertPrismaProductToProduct(product as PrismaProduct)
      return converted
    })

    console.log("Produtos convertidos:", convertedProducts.length)

    return convertedProducts
  } catch (error) {
    console.error("Erro ao buscar produtos do usuário:", error)
    return []
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    console.log("Buscando todos os produtos disponíveis")

    const products = await prisma.tbFerramentas.findMany({
      where: {
        bdAtivo: true,
        bdEstado: "disponível",
      },
      include: {
        cliente: true,
      },
      orderBy: { bdDTCADASTRO: "desc" },
    })

    console.log("Todos os produtos encontrados:", products.length)

    return products.map((product) => convertPrismaProductToProduct(product as PrismaProduct))
  } catch (error) {
    console.error("Erro ao buscar todos os produtos:", error)
    return []
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    console.log("Buscando produto por ID:", productId)

    const product = await prisma.tbFerramentas.findUnique({
      where: { bdChave: BigInt(productId) },
      include: {
        cliente: true,
      },
    })

    if (!product || !product.bdAtivo) {
      console.log("Produto não encontrado ou inativo")
      return null
    }

    const converted = convertPrismaProductToProduct(product as PrismaProduct)
    console.log("Produto encontrado e convertido:", converted)

    return converted
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }
}

export async function searchProducts(searchTerm: string, category?: string): Promise<Product[]> {
  try {
    console.log("Buscando produtos com termo:", searchTerm, "categoria:", category)

    const whereCondition: any = {
      bdAtivo: true,
      bdEstado: "disponível",
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

    const products = await prisma.tbFerramentas.findMany({
      where: whereCondition,
      include: {
        cliente: true,
      },
      orderBy: { bdDTCADASTRO: "desc" },
    })

    console.log("Produtos encontrados na busca:", products.length)

    return products.map((product) => convertPrismaProductToProduct(product as PrismaProduct))
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    console.log("Buscando produtos em destaque")

    const products = await prisma.tbFerramentas.findMany({
      where: {
        bdAtivo: true,
        bdEstado: "disponível",
      },
      include: {
        cliente: true,
      },
      orderBy: { bdDTCADASTRO: "desc" },
      take: 8,
    })

    console.log("Produtos em destaque encontrados:", products.length)

    return products.map((product) => {
      const converted = convertPrismaProductToProduct(product as PrismaProduct)
      return {
        ...converted,
        isNew: true,
      }
    })
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error)
    return []
  }
}

// Função para testar a conexão com o banco
export async function testDatabaseConnection() {
  try {
    console.log("Testando conexão com o banco de dados...")

    const totalProducts = await prisma.tbFerramentas.count()
    const totalClients = await prisma.tbClientes.count()
    const availableProducts = await prisma.tbFerramentas.count({
      where: {
        bdAtivo: true,
        bdEstado: "disponível",
      },
    })

    const sampleProduct = await prisma.tbFerramentas.findFirst({
      include: {
        cliente: true,
      },
    })

    console.log("Estatísticas do banco:")
    console.log("- Total de produtos:", totalProducts)
    console.log("- Total de clientes:", totalClients)
    console.log("- Produtos disponíveis:", availableProducts)

    return {
      success: true,
      message: `Conexão OK. Produtos: ${totalProducts}, Clientes: ${totalClients}, Disponíveis: ${availableProducts}`,
      stats: {
        totalProducts,
        totalClients,
        availableProducts,
      },
      sample: sampleProduct,
    }
  } catch (error) {
    console.error("Erro ao testar conexão:", error)
    return {
      success: false,
      message: "Erro na conexão com o banco de dados",
      error: error,
    }
  }
}
