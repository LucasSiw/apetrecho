"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Mail, Shield, Zap } from "lucide-react"

export default function SetupDomainPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Configurar Domínio para Email</h1>

      <div className="grid gap-6">
        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Status Atual do Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Gmail SMTP</span>
                <Badge variant="default">✅ Funcionando</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Resend</span>
                <Badge variant="secondary">⚠️ Limitado (apenas teste)</Badge>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Recomendação:</strong> Configure um domínio no Resend para melhor deliverability e
                  funcionalidades avançadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guia Resend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Como Configurar Domínio no Resend
            </CardTitle>
            <CardDescription>Siga estes passos para configurar seu próprio domínio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Passo 1: Acessar Resend</h3>
                <p className="text-sm text-gray-600 mb-2">Acesse o painel do Resend e vá para a seção de domínios</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">
                    Abrir Resend Domains <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Passo 2: Adicionar Domínio</h3>
                <p className="text-sm text-gray-600">Clique em "Add Domain" e digite seu domínio (ex: apetrecho.com)</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Passo 3: Configurar DNS</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Adicione os registros DNS fornecidos pelo Resend no seu provedor de domínio:
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>TXT: v=spf1 include:_spf.resend.com ~all</div>
                  <div>CNAME: resend._domainkey</div>
                  <div>CNAME: _dmarc</div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold">Passo 4: Verificar</h3>
                <p className="text-sm text-gray-600">
                  Aguarde a verificação (pode levar até 24h) e depois atualize o código para usar seu domínio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternativas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Alternativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Continuar com Gmail</h4>
                <p className="text-sm text-gray-600">
                  Seu Gmail está funcionando perfeitamente. Você pode continuar usando até configurar o domínio.
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Usar Resend apenas para testes</h4>
                <p className="text-sm text-gray-600">
                  Para testes, você pode enviar emails apenas para apetrecho329@gmail.com usando Resend.
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Outros provedores</h4>
                <p className="text-sm text-gray-600">
                  SendGrid, Mailgun, Amazon SES são outras opções para envio de emails em produção.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
