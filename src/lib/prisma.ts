import { prisma } from "@/lib/database"; 

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