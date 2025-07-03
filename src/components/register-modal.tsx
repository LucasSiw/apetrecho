"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputCNPJCPF, InputTelefone, InputData, InputCEP } from "@/context/controle"
import { useState } from "react"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

export function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const [step, setStep] = useState<"form" | "verification" | "confirmed">("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [nascimento, setNascimento] = useState("")
  const [cep, setCep] = useState("")
  const [logradouro, setLogradouro] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Dados temporários para o registro
  const [tempRegistrationData, setTempRegistrationData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        nome: name,
        email,
        telefone,
        cpf,
        nascimento,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        senha: password,
      }

      // Salva os dados temporariamente
      setTempRegistrationData(payload)

      // Envia o código de verificação
      const res = await fetch("/api/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao enviar código de verificação.")
        return
      }

      // Muda para a tela de verificação
      setStep("verification")
      setSuccessMsg("Código de verificação enviado para seu e-mail.")
    } catch {
      setErrorMsg("Erro ao conectar com o servidor.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!code.trim()) {
      setErrorMsg("Por favor, insira o código de verificação.")
      return
    }

    setIsLoading(true)

    try {
      // Primeiro verifica o código
      const verifyRes = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setErrorMsg(verifyData.error || "Código inválido ou expirado.")
        return
      }

      // Se o código estiver correto, registra o cliente
      const registerRes = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempRegistrationData),
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        setErrorMsg(registerData.error || "Erro ao registrar cliente.")
        return
      }

      // Sucesso - vai para a tela de confirmação
      setStep("confirmed")
    } catch {
      setErrorMsg("Erro ao conectar com o servidor.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao reenviar código.")
        return
      }

      setSuccessMsg("Novo código enviado para seu e-mail.")
    } catch {
      setErrorMsg("Erro ao reenviar código.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep("form")
    setName("")
    setEmail("")
    setCode("")
    setPassword("")
    setConfirmPassword("")
    setCpf("")
    setTelefone("")
    setNascimento("")
    setCep("")
    setLogradouro("")
    setNumero("")
    setComplemento("")
    setBairro("")
    setCidade("")
    setEstado("")
    setErrorMsg(null)
    setSuccessMsg(null)
    setTempRegistrationData(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] mx-4 w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {step === "form" && "Criar uma conta"}
            {step === "verification" && "Verificar e-mail"}
            {step === "confirmed" && "Conta criada!"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {step === "form" && "Registre-se para começar a alugar e acompanhar seus pedidos."}
            {step === "verification" && "Digite o código de verificação enviado para seu e-mail."}
            {step === "confirmed" && "Sua conta foi criada com sucesso!"}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <Label>Nome completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />

              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <InputCNPJCPF value={cpf} onChange={(e) => setCpf(e.target.value)} />

              <InputTelefone value={telefone} onChange={(e) => setTelefone(e.target.value)} />

              <InputData value={nascimento} onChange={(e) => setNascimento(e.target.value)} />

              <InputCEP
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onAutoFill={({ logradouro, bairro, cidade, estado }) => {
                  setLogradouro(logradouro)
                  setBairro(bairro)
                  setCidade(cidade)
                  setEstado(estado)
                }}
              />

              <Label>Logradouro</Label>
              <Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} required disabled = {true} />

              <Label>Bairro</Label>
              <Input value={bairro} onChange={(e) => setBairro(e.target.value)} required disabled = {true} />

              <Label>Cidade</Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} required disabled = {true} />

              <Label>Estado</Label>
              <Input value={estado} onChange={(e) => setEstado(e.target.value)} required disabled = {true} />

              <Label>Número</Label>
              <Input value={numero} onChange={(e) => setNumero(e.target.value)} required />

              <Label>Complemento</Label>
              <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} />

              <Label>Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Label>Confirmar senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-green-600 text-center">{successMsg}</p>}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando código..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "verification" && (
          <form onSubmit={handleCodeVerification}>
            <div className="grid gap-4 py-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Enviamos um código de verificação para:</p>
                <p className="font-medium text-sm mb-6">{email}</p>
              </div>

              <Label>Código de verificação</Label>
              <Input
                placeholder="Digite o código recebido"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Não recebeu o código? Reenviar
                </Button>
              </div>
            </div>

            {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-green-600 text-center">{successMsg}</p>}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("form")}
                disabled={isLoading}
                className="w-full"
              >
                Voltar
              </Button>
              <Button type="submit" className="w-full" disabled={isLoading || !code.trim()}>
                {isLoading ? "Verificando..." : "Verificar e finalizar"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "confirmed" && (
          <div className="text-center py-10 px-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold mb-2">Conta criada com sucesso!</h2>
            <p className="text-sm text-muted-foreground mb-6">Sua conta foi verificada e está pronta para uso.</p>
            <Button
              className="w-full"
              onClick={() => {
                handleClose()
                onLoginClick()
              }}
            >
              Ir para login
            </Button>
          </div>
        )}

        {step === "form" && (
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Button variant="link" className="p-0 text-sm" onClick={onLoginClick}>
                Faça login
              </Button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
