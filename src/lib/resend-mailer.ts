import { Resend } from "resend"

// Verificar se a API key existe e é válida
const apiKey = process.env.RESEND_API_KEY

let resend: Resend | null = null

if (apiKey && apiKey.startsWith("re_")) {
  resend = new Resend(apiKey)
  console.log("✅ Resend configurado com sucesso")
} else {
  console.log("⚠️ Resend não configurado ou API key inválida")
}

export async function sendVerificationEmail(email: string, code: string) {
  if (!resend) {
    throw new Error("RESEND_NOT_CONFIGURED")
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Email de teste do Resend
      to: [email],
      subject: "Código de Verificação - Apetrecho",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Apetrecho</h1>
          </div>
          
          <h2 style="color: #333; text-align: center;">Código de Verificação</h2>
          
          <p style="color: #666; font-size: 16px;">
            Olá! Use o código abaixo para verificar seu e-mail:
          </p>
          
          <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; font-family: monospace;">
              ${code}
            </span>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            ⏰ Este código expira em <strong>15 minutos</strong>.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Se você não solicitou este código, pode ignorar este e-mail com segurança.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © 2024 Apetrecho. Todos os direitos reservados.
          </p>
        </div>
      `,
      text: `Seu código de verificação Apetrecho é: ${code}. Este código expira em 15 minutos.`,
    })

    if (error) {
      console.error("❌ Erro Resend:", error)

      // Se for erro de domínio, lançar erro específico para usar Gmail como fallback
      if (error.message?.includes("verify a domain") || error.message?.includes("testing emails")) {
        throw new Error("RESEND_DOMAIN_NOT_VERIFIED")
      }

      throw new Error(`Erro ao enviar email: ${error.message}`)
    }

    console.log("✅ Email enviado via Resend:", data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error)
    throw error
  }
}

export async function verifyResendConnection() {
  try {
    if (!apiKey) {
      console.log("⚠️ RESEND_API_KEY não configurada")
      return false
    }

    if (!apiKey.startsWith("re_")) {
      console.log("⚠️ RESEND_API_KEY inválida (deve começar com 're_')")
      return false
    }

    if (!resend) {
      console.log("⚠️ Resend não inicializado")
      return false
    }

    console.log("✅ Resend configurado corretamente")
    return true
  } catch (error) {
    console.error("❌ Erro na conexão Resend:", error)
    return false
  }
}
