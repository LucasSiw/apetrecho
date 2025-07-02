import nodemailer from "nodemailer"

// Verificar se as credenciais do Gmail existem
const gmailUser = process.env.SMTP_USER
const gmailPass = process.env.SMTP_PASS

if (!gmailUser || !gmailPass) {
  console.error("❌ Credenciais SMTP do Gmail não encontradas")
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: gmailUser,
    pass: gmailPass, // Esta deve ser uma senha de aplicativo, não sua senha normal
  },
  tls: {
    rejectUnauthorized: false,
  },
})

export async function sendVerificationEmailGmail(email: string, code: string) {
  try {
    const mailOptions = {
      from: {
        name: "Apetrecho",
        address: process.env.SMTP_FROM!,
      },
      to: email,
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
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("✅ Email enviado via Gmail:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("❌ Erro ao enviar email via Gmail:", error)
    throw error
  }
}

export async function verifyGmailConnection() {
  try {
    if (!gmailUser || !gmailPass) {
      throw new Error("Credenciais SMTP não configuradas")
    }

    await transporter.verify()
    console.log("✅ Gmail SMTP conectado com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro na conexão Gmail:", error)
    return false
  }
}
