import { type NextRequest, NextResponse } from "next/server"
import { loginUser, type LoginData } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação básica
    if (!body.bdEmail || !body.bdSenha) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const loginData: LoginData = {
      bdEmail: body.bdEmail,
      bdSenha: body.bdSenha,
    }

    const result = await loginUser(loginData)

    if (!result) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Criar resposta com cookie
    const response = NextResponse.json({
      message: "Login realizado com sucesso",
      user: result.user,
    })

    // Definir cookie com o token
    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return response
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
