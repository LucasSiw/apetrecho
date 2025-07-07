import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

// Importar apenas Gmail por enquanto
import { sendVerificationEmailGmail, verifyGmailConnection } from "@/lib/gmail-mailer"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Deletar códigos antigos para este email
    await prisma.tbEmailVerificado.deleteMany({
      where: {
        bdEmail: email,
      },
    })

    // Criar novo código
    await prisma.tbEmailVerificado.create({
      data: {
        bdEmail: email,
        bdCode: code,
        bdExpiresAt: expiresAt,
      },
    })

    let emailSent = false
    let emailProvider = ""
    let lastError = ""

    // Usar apenas Gmail (que está funcionando)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        console.log("🔄 Enviando via Gmail...")
        const gmailConnected = await verifyGmailConnection()
        if (gmailConnected) {
          await sendVerificationEmailGmail(email, code)
          emailSent = true
          emailProvider = "Gmail"
          console.log("✅ Email enviado via Gmail com sucesso")
        } else {
          lastError = "Gmail não conectou"
        }
      } catch (error) {
        console.error("❌ Gmail falhou:", error)
        lastError = error instanceof Error ? error.message : "Erro Gmail desconhecido"
      }
    } else {
      lastError = "Credenciais Gmail não configuradas"
    }

    if (!emailSent) {
      console.error("❌ Falha ao enviar email via Gmail")
      return NextResponse.json(
        {
          error: `Falha ao enviar email via Gmail: ${lastError}`,
          details: "Verifique as configurações de SMTP do Gmail",
        },
        { status: 500 },
      )
    }

    console.log(`✅ Código enviado para ${email} via ${emailProvider}: ${code}`)

    return NextResponse.json({
      success: true,
      message: `Código enviado com sucesso via ${emailProvider}`,
      provider: emailProvider,
    })
  } catch (error) {
    console.error("❌ Erro geral ao enviar código:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: `Erro ao enviar email: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ error: "Erro interno do servidor ao enviar código" }, { status: 500 })
  }
}
