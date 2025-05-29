import { type NextRequest, NextResponse } from "next/server"
import { registerUser, type RegisterData } from "@/lib/auth"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação básica
    const requiredFields = [
      "bdNome",
      "bdEmail",
      "bdSenha",
      "bdLogradouro",
      "bdNumero",
      "bdBairro",
      "bdCidade",
      "bdEstado",
      "bdCEP",
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Campo ${field} é obrigatório` }, { status: 400 })
      }
    }

    // Verificar se o email já existe
    const existingUser = await prisma.tbClientes.findUnique({
      where: { bdEmail: body.bdEmail },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Verificar se o CPF já existe (se fornecido)
    if (body.bdcpf) {
      const existingCPF = await prisma.tbClientes.findUnique({
        where: { bdcpf: body.bdcpf },
      })

      if (existingCPF) {
        return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 })
      }
    }

    const userData: RegisterData = {
      bdNome: body.bdNome,
      bdEmail: body.bdEmail,
      bdSenha: body.bdSenha,
      bdTelefone: body.bdTelefone || null,
      bdcpf: body.bdcpf || null,
      bdDTNASCIMENTO: body.bdDTNASCIMENTO ? new Date(body.bdDTNASCIMENTO) : undefined,
      bdLogradouro: body.bdLogradouro,
      bdNumero: body.bdNumero,
      bdComplemento: body.bdComplemento || null,
      bdBairro: body.bdBairro,
      bdCidade: body.bdCidade,
      bdEstado: body.bdEstado,
      bdCEP: body.bdCEP,
    }

    const user = await registerUser(userData)

    return NextResponse.json(
      {
        message: "Usuário registrado com sucesso",
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
