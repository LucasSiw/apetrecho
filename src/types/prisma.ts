// Tipo manual baseado na estrutura da tabela tbferramentas
export interface PrismaProduct {
  bdChave: bigint
  bdChaveCli: number | null
  bdNome: string
  bdDescricao: string | null
  bdCategoria: string | null
  bdURLIMG: string | null
  bdPrecoAluguel: {
    toNumber(): number
  }
  bdEstado: "dispon_vel" | "alugada" | "manuten__o" | null
  bdDTCADASTRO: Date
  bdAtivo: boolean | null
}

// Função para converter produto do Prisma para o tipo Product da aplicação
export function convertPrismaProductToProduct(product: PrismaProduct): import("@/types/product").Product {
  return {
    id: product.bdChave.toString(),
    name: product.bdNome,
    description: product.bdDescricao || "",
    price: product.bdPrecoAluguel.toNumber(),
    originalPrice: undefined,
    category: product.bdCategoria || "Geral",
    stock: product.bdEstado === "dispon_vel" ? 1 : 0,
    image: product.bdURLIMG || "/placeholder.svg?height=300&width=300",
    brand: "Apetrecho",
    isNew: false,
    rating: Math.random() * 2 + 3,
    reviewCount: Math.floor(Math.random() * 50) + 5,
    sku: `APT-${product.bdChave}`,
    installments: {
      count: 12,
      value: Math.round((product.bdPrecoAluguel.toNumber() / 12) * 100) / 100,
    },
  }
}
