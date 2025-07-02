import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: "apetrecho329@gmail.com", // seu email do Gmail
    pass: "Apetrecho@1Sen4i", // senha de aplicativo do Gmail
  },
  tls: {
    rejectUnauthorized: false,
  },
})

// Função para verificar a conexão
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log("✅ Servidor de email conectado com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro na conexão do email:", error)
    return false
  }
}
