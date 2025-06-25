// apeterecho/src/lib/actions/orders.ts
"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Definição dos tipos já existentes (mantenha-os)
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
        ferramenta: { // Inclui os dados da ferramenta relacionada ao aluguel
          select: {
            bdChave: true, // Select this BigInt
            bdNome: true,
            bdURLIMG: true,
            bdPrecoAluguel: true, // Select this Decimal
            bdDescricao: true,
          },
        },
      },
      orderBy: {
        bdDTINICIO: 'desc',
      },
    });

    // Mapear os dados do Prisma para o formato Order que sua página espera
    const formattedOrders: UserOrder[] = rentals.map(rental => ({
      // Convert BigInt to string for IDs
      id: rental.bdChave.toString(),
      date: rental.bdDTINICIO.toISOString().split('T')[0],
      // Convert Decimal to number for monetary values
      total: rental.bdVlrTotal ? rental.bdVlrTotal.toNumber() : 0,
      status: rental.bdStatus || "desconhecido",
      paymentMethod: "Não disponível (Simulado)",
      estimatedDelivery: rental.bdDTFIM ? rental.bdDTFIM.toISOString().split('T')[0] : "Aguardando",

      items: rental.ferramenta ? [{
        // Convert BigInt to string for product ID
        productId: rental.ferramenta.bdChave.toString(),
        productName: rental.ferramenta.bdNome,
        productImage: rental.ferramenta.bdURLIMG || "/placeholder.svg",
        quantity: 1,
        // Convert Decimal to number for item price
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
    // It's generally not recommended to disconnect Prisma client after every action
    // if you have many actions or frequent calls, as it can lead to performance overhead.
    // Instead, consider managing the Prisma client lifecycle globally or lazily.
    // However, for small applications or infrequent calls, it might be acceptable.
    // For now, I'll keep it as you had it, but be aware of this.
    // await prisma.$disconnect();
  }
}

// ==========================================================
// NOVA FUNÇÃO: REGISTRAR UM NOVO ALUGUEL
// ==========================================================

// Tipo para os dados de entrada de um novo aluguel
type NewRentalData = {
  clienteId: number;
  ferramentaId: bigint; // O bdChave da ferramenta é BigInt no seu schema
  dataInicio: Date;
  dataFim?: Date; // Opcional, pode ser indefinido se o período não for fixo
  valorTotal: number;
  statusInicial?: string; // Opcional, default "ativo"
};

/**
 * Registra um novo aluguel na tabela tbAlugueis.
 * @param data Os dados do novo aluguel (clienteId, ferramentaId, dataInicio, dataFim, valorTotal, statusInicial).
 * @returns Um objeto indicando sucesso ou falha, e o aluguel criado.
 */
export async function createRental(data: NewRentalData) {
  try {
    // Validações básicas (adicione mais se necessário)
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
        bdStatus: data.statusInicial || "ativo", // Usa o status fornecido ou "ativo" como padrão
      },
    });

    // Opcional: Atualizar o estoque da ferramenta aqui, se aplicável
    // Ex: await prisma.tbFerramentas.update({ where: { bdChave: data.ferramentaId }, data: { bdEstoque: { decrement: 1 } } });

    console.log("Novo aluguel registrado:", newRental);
    return { success: true, message: "Aluguel registrado com sucesso!", rental: newRental };

  } catch (error: any) {
    console.error("Erro ao registrar novo aluguel:", error);
    return { success: false, message: `Erro ao registrar aluguel: ${error.message}`, rental: null };
  } finally {
    await prisma.$disconnect();
  }
}