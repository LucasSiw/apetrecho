"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestEmailPage() {
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)

  const checkConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-email")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Erro ao verificar configuração:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async (provider: "resend" | "gmail") => {
    if (!testEmail) {
      alert("Digite um email para teste")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, provider }),
      })

      const data = await response.json()
      setTestResults(data)

      if (data.success) {
        alert(`✅ ${data.message}`)
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      alert("❌ Erro ao enviar email de teste")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Teste de Configuração de Email</h1>

      <div className="grid gap-6">
        {/* Verificação de Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Verificar Configuração</CardTitle>
            <CardDescription>Verifique se os provedores de email estão configurados corretamente</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkConfiguration} disabled={loading} className="mb-4">
              {loading ? "Verificando..." : "Verificar Configuração"}
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{results.recommendation}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Resend Status */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Resend</h4>
                      <Badge variant={results.providers.resend.working ? "default" : "destructive"}>
                        {results.providers.resend.configured
                          ? results.providers.resend.working
                            ? "✅ Funcionando"
                            : "❌ Erro"
                          : "⚠️ Não configurado"}
                      </Badge>
                    </div>
                    {results.providers.resend.error && (
                      <p className="text-sm text-red-600">{results.providers.resend.error}</p>
                    )}
                  </div>

                  {/* Gmail Status */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Gmail</h4>
                      <Badge variant={results.providers.gmail.working ? "default" : "destructive"}>
                        {results.providers.gmail.configured
                          ? results.providers.gmail.working
                            ? "✅ Funcionando"
                            : "❌ Erro"
                          : "⚠️ Não configurado"}
                      </Badge>
                    </div>
                    {results.providers.gmail.error && (
                      <p className="text-sm text-red-600">{results.providers.gmail.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teste de Envio */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Email de Teste</CardTitle>
            <CardDescription>Envie um email de teste para verificar se está funcionando</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Digite seu email para teste"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />

              <div className="flex gap-2">
                <Button onClick={() => sendTestEmail("resend")} disabled={loading} variant="outline">
                  Testar Resend
                </Button>
                <Button onClick={() => sendTestEmail("gmail")} disabled={loading} variant="outline">
                  Testar Gmail
                </Button>
              </div>

              {testResults && (
                <div
                  className={`p-4 rounded-lg ${
                    testResults.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <p>{testResults.success ? testResults.message : testResults.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações de Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração Atual</CardTitle>
            <CardDescription>Variáveis de ambiente detectadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>RESEND_API_KEY:</span>
                <Badge variant={process.env.NEXT_PUBLIC_RESEND_CONFIGURED ? "default" : "secondary"}>
                  {typeof window !== "undefined" ? "Configurado" : "Verificando..."}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>SMTP_USER:</span>
                <Badge variant="default">apetrecho329@gmail.com</Badge>
              </div>
              <div className="flex justify-between">
                <span>SMTP_PASS:</span>
                <Badge variant="default">Configurado (senha de aplicativo)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
