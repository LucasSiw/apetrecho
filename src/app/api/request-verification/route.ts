import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

// Importar ambas as opções
import { sendVerificationEmail, verifyResendConnection } from "@/lib/resend-mailer"
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

    // Estratégia: Tentar Gmail primeiro (mais confiável para produção)
    // depois Resend como fallback

    // Opção 1: Tentar Gmail primeiro
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const gmailConnected = await verifyGmailConnection()
        if (gmailConnected) {
          await sendVerificationEmailGmail(email, code)
          emailSent = true
          emailProvider = "Gmail"
        }
      } catch (error) {
        console.log("⚠️ Gmail falhou, tentando Resend...")
        lastError = error instanceof Error ? error.message : "Erro Gmail desconhecido"
      }
    }

    // Opção 2: Fallback para Resend (apenas se Gmail falhar)
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        const resendConnected = await verifyResendConnection()
        if (resendConnected) {
          await sendVerificationEmail(email, code)
          emailSent = true
          emailProvider = "Resend"
        }
      } catch (error) {
        console.error("❌ Resend também falhou:", error)

        // Se for erro de domínio do Resend, usar mensagem específica
        if (error instanceof Error && error.message === "RESEND_DOMAIN_NOT_VERIFIED") {
          lastError = "Resend: Domínio não verificado. Configure um domínio em resend.com/domains"
        } else {
          lastError = error instanceof Error ? error.message : "Erro Resend desconhecido"
        }
      }
    }

    if (!emailSent) {
      return NextResponse.json(
        {
          error: `Falha ao enviar email. Último erro: ${lastError}`,
          details: "Verifique as configurações de email ou configure um domínio no Resend.",
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
    console.error("❌ Erro ao enviar código:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: `Erro ao enviar email: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ error: "Erro interno do servidor ao enviar código" }, { status: 500 })
  }
}
