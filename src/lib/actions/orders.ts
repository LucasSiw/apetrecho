"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  rentalDuration?: string; 
};

export type UserOrder = {
  id: string; 
  date: string; 
  total: number;
  status: "confirmado" | "processando" | "em_transito" | "entregue" | "cancelado" | string; 
  items: OrderItem[]; 
  paymentMethod: string; 
  estimatedDelivery?: string; 
};

/**
 * Busca todos os aluguéis feitos por um cliente específico.
 * @param userId O bdChave do cliente logado.
 * @returns Uma lista de UserOrder ou um objeto de erro.
 */
export async function getUserRentals(userId: number) {
  if (!userId) {
    return { success: false, message: "ID do usuário não fornecido.", data: [] };
  }

  try {
    const rentals = await prisma.tbAlugueis.findMany({
      where: {
        bdChaveCli: userId,
      },
      include: {
        ferramenta: {
          select: {
            bdChave: true,
            bdNome: true,
            bdURLIMG: true,
            bdPrecoAluguel: true,
            bdDescricao: true,
          },
        },
      },
      orderBy: {
        bdDTINICIO: 'desc', 
      },
    });

    const formattedOrders: UserOrder[] = rentals.map(rental => ({
      id: rental.bdChave.toString(), 
      date: rental.bdDTINICIO.toISOString().split('T')[0], 
      total: rental.bdVlrTotal ? rental.bdVlrTotal.toNumber() : 0, 
      status: rental.bdStatus || "desconhecido", 
      paymentMethod: "Não disponível (Simulado)", 
      estimatedDelivery: rental.bdDTFIM ? rental.bdDTFIM.toISOString().split('T')[0] : "Aguardando",

      items: rental.ferramenta ? [{
        productId: rental.ferramenta.bdChave.toString(),
        productName: rental.ferramenta.bdNome,
        productImage: rental.ferramenta.bdURLIMG || "/placeholder.svg",
        quantity: 1, 
        price: rental.ferramenta.bdPrecoAluguel.toNumber(),
        rentalDuration: rental.bdDTFIM && rental.bdDTINICIO
            ? `${Math.ceil(Math.abs(rental.bdDTFIM.getTime() - rental.bdDTINICIO.getTime()) / (1000 * 60 * 60 * 24))} dias`
            : undefined,
      }] : [],
    }));

    return { success: true, message: "Aluguéis carregados com sucesso.", data: formattedOrders };

  } catch (error: any) {
    console.error("Erro ao buscar aluguéis do usuário:", error);
    return { success: false, message: `Erro ao carregar aluguéis: ${error.message}`, data: [] };
  } finally {
    await prisma.$disconnect();
  }
}