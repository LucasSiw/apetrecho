import { prisma } from "@/lib/database"; 
import { useAuth } from "@/context/auth-context"

const { user } = useAuth()

export async function getUserProducts(userId: string) {
  console.log("Buscando produtos do usuário:", userId);
  try {
    const products = await prisma.tbFerramentas.findMany({
      where: {
        bdChaveCli: Number.parseInt(userId),
        bdAtivo: true,
      },
    });
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
}

export const alugueis = await prisma.tbAlugueis.findMany({
  where: {
    ferramenta: {
      bdChaveCli: user?.id ? Number(user.id) : undefined,
    },
  },
  include: {
    ferramenta: true,
    cliente: true,
  },
})