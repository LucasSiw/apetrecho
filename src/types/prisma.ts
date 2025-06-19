import type { Decimal } from "@prisma/client/runtime/library"
import type { Product } from "@/types/product"

// Interface que representa a estrutura da tabela tbFerramentas
export interface PrismaProduct {
  bdChave: bigint
  bdChaveCli: number | null
  bdNome: string
  bdDescricao: string | null
  bdCategoria: string | null
  bdURLIMG: string | null
  bdImagens: string | null // JSON string com array de imagens
  bdPrecoAluguel: Decimal
  bdEstado: "disponível" | "alugada" | "manutenção" | null
  bdDTCADASTRO: Date
  bdAtivo: boolean | null
  bdCondicao: string | null
  bdObservacoes: string | null
  cliente?: {
    bdNome: string
    bdEmail: string
    bdTelefone: string | null
  } | null
}

// Interface para tbClientes
export interface PrismaClient {
  bdChave: number
  bdNome: string
  bdEmail: string
  bdTelefone: string | null
  bdcpf: string | null
  bdDTNASCIMENTO: Date | null
  bdLogradouro: string
  bdNumero: string
  bdComplemento: string | null
  bdBairro: string
  bdCidade: string
  bdEstado: string
  bdCEP: string
  bdDTCriacao: Date
  bdAtivo: boolean | null
  bdSenha: string | null
}

// Função para converter produto do Prisma para o tipo Product da aplicação
export function convertPrismaProductToProduct(prismaProduct: PrismaProduct): Product {
  const price = prismaProduct.bdPrecoAluguel?.toNumber() || 0
  const isAvailable = prismaProduct.bdEstado === "disponível"

  // Processar imagens - usar bdImagens se disponível, senão usar bdURLIMG
  let images: string[] = []
  if (prismaProduct.bdImagens) {
    try {
      images = JSON.parse(prismaProduct.bdImagens)
    } catch (error) {
      console.error("Erro ao parsear imagens:", error)
      images = []
    }
  }

  // Se não há imagens no novo formato, usar a imagem antiga
  if (images.length === 0 && prismaProduct.bdURLIMG) {
    images = [prismaProduct.bdURLIMG]
  }

  // Se ainda não há imagens, usar placeholder
  if (images.length === 0) {
    images = ["/placeholder.svg?height=300&width=300"]
  }

  // Calcular se é novo (cadastrado nos últimos 30 dias)
  const isNew = prismaProduct.bdDTCADASTRO
    ? Date.now() - new Date(prismaProduct.bdDTCADASTRO).getTime() < 30 * 24 * 60 * 60 * 1000
    : false

  return {
    id: prismaProduct.bdChave.toString(),
    name: prismaProduct.bdNome || "Produto sem nome",
    description: prismaProduct.bdDescricao || "Sem descrição",
    price: price,
    originalPrice: undefined,
    image: images[0], // Primeira imagem como principal
    images: images, // Todas as imagens
    category: prismaProduct.bdCategoria || "Geral",
    rating: Math.random() * 1.5 + 3.5,
    reviewCount: Math.floor(Math.random() * 50) + 5,
    stock: isAvailable ? 1 : 0,
    isNew: isNew,
    installments:
      price > 100
        ? {
            count: Math.min(12, Math.floor(price / 50)),
            value: Number((price / Math.min(12, Math.floor(price / 50))).toFixed(2)),
          }
        : undefined,
    specifications: prismaProduct.bdObservacoes ? [prismaProduct.bdObservacoes] : undefined,
    brand: "Apetrecho",
    sku: `APT-${prismaProduct.bdChave.toString()}`,
    condition: prismaProduct.bdCondicao || "Usada",
    owner: prismaProduct.cliente
      ? {
          name: prismaProduct.cliente.bdNome,
          email: prismaProduct.cliente.bdEmail,
          phone: prismaProduct.cliente.bdTelefone,
        }
      : undefined,
  }
}

// Função para converter cliente do Prisma
export function convertPrismaClientToUser(prismaClient: PrismaClient) {
  return {
    id: prismaClient.bdChave.toString(),
    name: prismaClient.bdNome,
    email: prismaClient.bdEmail,
    phone: prismaClient.bdTelefone,
    cpf: prismaClient.bdcpf,
    birthDate: prismaClient.bdDTNASCIMENTO,
    address: {
      street: prismaClient.bdLogradouro,
      number: prismaClient.bdNumero,
      complement: prismaClient.bdComplemento,
      neighborhood: prismaClient.bdBairro,
      city: prismaClient.bdCidade,
      state: prismaClient.bdEstado,
      zipCode: prismaClient.bdCEP,
    },
    createdAt: prismaClient.bdDTCriacao,
    active: prismaClient.bdAtivo ?? true,
  }
}
