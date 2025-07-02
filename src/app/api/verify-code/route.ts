import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(req: Request) {
  const { email, code } = await req.json()

  const record = await prisma.tbEmailVerificado.findFirst({
    where: {
      bdEmail: email,
      bdCode: code,
      bdExpiresAt: {
        gt: new Date(),
      },
      bdVerified: false,
    },
    orderBy: {
      bdCreatedAt: "desc",
    },
  })

  if (!record) {
    return NextResponse.json({ success: false, error: "Código inválido ou expirado." }, { status: 400 })
  }

  await prisma.tbEmailVerificado.update({
    where: { bdChave: record.bdChave },
    data: { bdVerified: true },
  })

  return NextResponse.json({ success: true })
}
