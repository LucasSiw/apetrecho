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

// ==========================================================
// FUNÇÃO PARA BUSCAR ALUGUÉIS (já existente e funcional)
// ==========================================================
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
  }
}

// ==========================================================
// NOVA FUNÇÃO: REGISTRAR UM NOVO ALUGUEL
// ==========================================================

type NewRentalData = {
  clienteId: number;
  ferramentaId: bigint;
  dataInicio: Date;
  dataFim?: Date; 
  valorTotal: number;
  statusInicial?: string;
};

type CreatedRentalResult = {
  success: boolean;
  message: string;
  rental: {
    bdChave: string;
    bdChaveCli: number;
    bdChaveFer: string | null;
    bdDTINICIO: Date;
    bdDTFIM: Date | null;
    bdStatus: string;
    bdVlrTotal: number | null;
  } | null;
};

/**
 * Registra um novo aluguel na tabela tbAlugueis.
 * @param data Os dados do novo aluguel (clienteId, ferramentaId, dataInicio, dataFim, valorTotal, statusInicial).
 * @returns Um objeto indicando sucesso ou falha, e o aluguel criado com tipos compatíveis.
 */
export async function createRental(data: NewRentalData): Promise<CreatedRentalResult> {
  try {
    if (!data.clienteId || !data.ferramentaId || !data.dataInicio || !data.valorTotal) {
      return { success: false, message: "Dados de aluguel incompletos.", rental: null };
    }

    const newRental = await prisma.tbAlugueis.create({
      data: {
        bdChaveCli: data.clienteId,
        bdChaveFer: data.ferramentaId,
        bdDTINICIO: data.dataInicio,
        bdDTFIM: data.dataFim,
        bdVlrTotal: data.valorTotal,
        bdStatus: data.statusInicial || "confirmado", 
      },
    });

    console.log("Novo aluguel registrado (Prisma raw object):", newRental); 


    const formattedRental = {
      bdChave: newRental.bdChave.toString(),
      bdChaveCli: newRental.bdChaveCli ?? 0, 
      bdChaveFer: newRental.bdChaveFer ? newRental.bdChaveFer.toString() : null, 
      bdDTINICIO: newRental.bdDTINICIO,
      bdDTFIM: newRental.bdDTFIM,
      bdStatus: newRental.bdStatus ?? "", 
      bdVlrTotal: newRental.bdVlrTotal ? newRental.bdVlrTotal.toNumber() : null, 
    };

    return { success: true, message: "Aluguel registrado com sucesso!", rental: formattedRental };

  } catch (error: any) {
    console.error("Erro ao registrar novo aluguel:", error);
    return { success: false, message: `Erro ao registrar aluguel: ${error.message}`, rental: null };
  } finally {
  }
}