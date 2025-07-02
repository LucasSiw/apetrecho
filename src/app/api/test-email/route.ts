import { NextResponse } from "next/server"
import { sendVerificationEmail, verifyResendConnection } from "@/lib/resend-mailer"
import { sendVerificationEmailGmail, verifyGmailConnection } from "@/lib/gmail-mailer"

export async function GET() {
  const results: {
    resend: { configured: boolean; working: boolean; error: string | null },
    gmail: { configured: boolean; working: boolean; error: string | null },
  } = {
    resend: { configured: false, working: false, error: null },
    gmail: { configured: false, working: false, error: null },
  }

  // Testar Resend
  if (process.env.RESEND_API_KEY) {
    results.resend.configured = true
    try {
      const resendWorking = await verifyResendConnection()
      results.resend.working = resendWorking
    } catch (error) {
      results.resend.error = error instanceof Error ? error.message : "Erro desconhecido"
    }
  }

  // Testar Gmail
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    results.gmail.configured = true
    try {
      const gmailWorking = await verifyGmailConnection()
      results.gmail.working = gmailWorking
    } catch (error) {
      results.gmail.error = error instanceof Error ? error.message : "Erro desconhecido"
    }
  }

  return NextResponse.json({
    message: "Teste de configuração de email",
    providers: results,
    recommendation:
      results.resend.working && results.gmail.working
        ? "✅ Ambos funcionando! Resend será usado como principal."
        : results.resend.working
          ? "✅ Resend funcionando!"
          : results.gmail.working
            ? "✅ Gmail funcionando!"
            : "❌ Nenhum provedor funcionando",
  })
}

export async function POST(req: Request) {
  try {
    const { email, provider } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const testCode = "123456"

    if (provider === "resend" || !provider) {
      if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: "Resend não configurado" }, { status: 400 })
      }

      try {
        await sendVerificationEmail(email, testCode)
        return NextResponse.json({
          success: true,
          message: `Email de teste enviado via Resend para ${email}`,
          provider: "Resend",
        })
      } catch (error) {
        return NextResponse.json(
          { error: `Erro Resend: ${error instanceof Error ? error.message : "Erro desconhecido"}` },
          { status: 500 },
        )
      }
    }

    if (provider === "gmail") {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return NextResponse.json({ error: "Gmail não configurado" }, { status: 400 })
      }

      try {
        await sendVerificationEmailGmail(email, testCode)
        return NextResponse.json({
          success: true,
          message: `Email de teste enviado via Gmail para ${email}`,
          provider: "Gmail",
        })
      } catch (error) {
        return NextResponse.json(
          { error: `Erro Gmail: ${error instanceof Error ? error.message : "Erro desconhecido"}` },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ error: "Provedor inválido" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
