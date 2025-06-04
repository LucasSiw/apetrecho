"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context" // Assuming useAuth provides login function

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onRegisterClick: () => void
}

export function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { login } = useAuth() // Assuming useAuth has a login function that handles setting user state and token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null) // Clear previous errors

    setIsLoading(true)

    try {
      const payload = {
        email,
        password,
      }
      const res = await fetch('/api/login', { // *** Changed endpoint to /api/login ***
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        // If the response is not OK (e.g., 401 Unauthorized, 400 Bad Request)
        setErrorMsg(data.error || 'Login failed. Please check your credentials.')
        return
      }

      // If login is successful
      if (login) { // Check if login function exists from context
        login(data.token, data.user); // Call the login function from your auth context
      }

      onClose() // Close the modal on successful login
    } catch (err) {
      console.error('[ERRO FETCH FRONT]', err)
      setErrorMsg('Failed to connect to the server. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] mx-4 w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Entrar na sua conta</DialogTitle>
          <DialogDescription className="text-sm">
            Faça login para acessar sua conta e gerenciar seus pedidos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
            {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>} {/* Display error message */}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </DialogFooter>
        </form>
        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Não tem uma conta?{" "}
            <Button variant="link" className="p-0 text-sm" onClick={onRegisterClick}>
              Registre-se
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}