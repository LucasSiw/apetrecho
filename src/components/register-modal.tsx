"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import { InputCNPJCPF } from "@/context/controle"
import { InputTelefone } from "@/context/controle"
import { InputData } from "@/context/controle"
import { InputCEP } from "@/context/controle"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

export function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("As senhas não coincidem")
      return
    }

    setIsLoading(true)

    try {
      // Simulando um registro bem-sucedido
      await register(name, email, password)
      onClose()
    } catch (error) {
      console.error("Erro ao registrar:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] mx-4 w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Criar uma conta</DialogTitle>
          <DialogDescription className="text-sm">
            Registre-se para começar a comprar e acompanhar seus pedidos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm">
                Nome completo
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-base" // Prevents zoom on iOS
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base" // Prevents zoom on iOS
              />
            </div>
            <div className="grid gap-2">
              <InputCNPJCPF></InputCNPJCPF>
            </div>
            <div className="grid gap-2">
              <InputTelefone></InputTelefone>
            </div>
            <div className="grid gap-2">
              <InputData></InputData>
            </div>
            <div className="grid gap-2">
              <InputCEP></InputCEP>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base" // Prevents zoom on iOS
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirmar senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="text-base" // Prevents zoom on iOS
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Já tem uma conta?{" "}
            <Button variant="link" className="p-0 text-sm" onClick={onLoginClick}>
              Faça login
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
