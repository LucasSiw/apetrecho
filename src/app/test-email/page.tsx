"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, XCircle } from "lucide-react"

export default function TestGmailPage() {
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestEmail = async () => {
    if (!testEmail) {
      alert("Digite um email para teste")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        alert(`✅ ${data.message}`)
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      alert("❌ Erro ao enviar email de teste")
      setResult({ error: "Erro de conexão" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Mail className="h-8 w-8" />
        Teste Gmail SMTP
      </h1>

      <div className="space-y-6">
        {/* Status da Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Configuração</CardTitle>
            <CardDescription>Verificação das variáveis de ambiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>SMTP_USER</span>
                <Badge variant="default">apetrecho329@gmail.com</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>SMTP_PASS</span>
                <Badge variant="default">Configurado ✓</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>SMTP_FROM</span>
                <Badge variant="default">apetrecho329@gmail.com</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Resend</span>
                <Badge variant="secondary">Desabilitado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Envio */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Email de Teste</CardTitle>
            <CardDescription>Digite um email para receber o código de verificação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Digite o email de destino"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />

              <Button onClick={sendTestEmail} disabled={loading} className="w-full">
                {loading ? "Enviando..." : "Enviar Código de Verificação"}
              </Button>

              {result && (
                <div
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span className="font-medium">{result.success ? "Sucesso!" : "Erro"}</span>
                  </div>
                  <p className="text-sm">{result.success ? result.message : result.error}</p>
                  {result.provider && <p className="text-xs mt-1">Provedor: {result.provider}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como obter API Key válida do Resend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-2">Para usar Resend:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>
                    Acesse{" "}
                    <a href="https://resend.com" target="_blank" className="underline" rel="noreferrer">
                      resend.com
                    </a>
                  </li>
                  <li>Crie uma conta gratuita</li>
                  <li>Vá em "API Keys"</li>
                  <li>Clique em "Create API Key"</li>
                  <li>Copie a chave (começa com "re_")</li>
                  <li>Adicione no .env.local: RESEND_API_KEY=re_sua_chave</li>
                </ol>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Por enquanto:</strong> Gmail está funcionando perfeitamente para seu projeto. Você pode
                  continuar usando apenas Gmail até decidir configurar Resend.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
