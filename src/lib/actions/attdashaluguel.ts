import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardData = async (
  req: { user: { id: number; }; },
  res: { status: (arg0: number) => { json: (arg0: any) => void; }; }
) => {
  const userId = req.user.id;

  try {
    const convertBigIntToString = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }
      const newObj: any = Array.isArray(obj) ? [] : {};

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (typeof obj[key] === 'bigint') {
            newObj[key] = obj[key].toString();
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            newObj[key] = convertBigIntToString(obj[key]);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
      return newObj;
    };

    const userProducts = await prisma.tbFerramentas.findMany({
      where: {
        bdChaveCli: userId,
      },
      select: {
        bdChave: true,
        bdNome: true,
        bdDescricao: true,
        bdURLIMG: true,
        bdPrecoAluguel: true,
        bdEstado: true,
        bdCondicao: true,
        bdAtivo: true,
      },
    });

    const userProductKeys = new Set(userProducts.map(p => p.bdChave));

    const allRelevantRentals = await prisma.tbAlugueis.findMany({
      where: {
        OR: [
          { bdChaveCli: userId },
          { bdChaveFer: { in: Array.from(userProductKeys) } },
        ],
      },
      include: {
        cliente: {
          select: {
            bdChave: true,
            bdNome: true,
            bdEmail: true,
          },
        },
        ferramenta: {
          select: {
            bdChave: true,
            bdNome: true,
            bdURLIMG: true,
            bdPrecoAluguel: true,
            bdEstado: true,
            bdChaveCli: true,
          },
        },
      },
    });

    const rentalsMadeByYou: any[] = []; 
    const yourProductsRentedByOthers: any[] = [];

    allRelevantRentals.forEach(rental => {
      if (!rental.ferramenta) {
        console.warn(`Aluguel ${rental.bdChave} sem ferramenta associada, ignorando.`);
        return;
      }

      if (rental.bdChaveCli === userId) {
        rentalsMadeByYou.push(convertBigIntToString({
          id: rental.ferramenta.bdChave,
          name: rental.ferramenta.bdNome,
          image: rental.ferramenta.bdURLIMG,
          price: rental.ferramenta.bdPrecoAluguel.toNumber(),
          rentalId: rental.bdChave,
          rentalStatus: rental.bdStatus,
          rentalStartDate: rental.bdDTINICIO,
          rentalEndDate: rental.bdDTFIM,
        }));
      } else if (userProductKeys.has(rental.ferramenta.bdChave)) {
        yourProductsRentedByOthers.push(convertBigIntToString({
          id: rental.ferramenta.bdChave,
          name: rental.ferramenta.bdNome,
          image: rental.ferramenta.bdURLIMG,
          price: rental.ferramenta.bdPrecoAluguel.toNumber(),
          rentalId: rental.bdChave,
          rentalStatus: rental.bdStatus,
          rentalStartDate: rental.bdDTINICIO,
          rentalEndDate: rental.bdDTFIM,
          clientName: rental.cliente?.bdNome || 'Cliente Desconhecido',
          clientId: rental.cliente?.bdChave,
        }));
      }
    });

    const serializableUserProducts = userProducts.map(p => convertBigIntToString({
      bdChave: p.bdChave,
      bdNome: p.bdNome,
      bdDescricao: p.bdDescricao,
      bdURLIMG: p.bdURLIMG,
      bdPrecoAluguel: p.bdPrecoAluguel.toNumber(),
      bdEstado: p.bdEstado,
      bdCondicao: p.bdCondicao,
      bdAtivo: p.bdAtivo,
    }));

    const orders: any[] = [];

    res.status(200).json({
      userProducts: serializableUserProducts,
      rentalsMadeByYou,
      yourProductsRentedByOthers,
      orders,
    });

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ message: "Erro ao carregar dados do dashboard." });
  }
};