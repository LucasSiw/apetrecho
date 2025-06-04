'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputCNPJCPF, InputTelefone, InputData, InputCEP } from '@/context/controle'
import { useState } from 'react'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

export function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
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
        senha: password, // ⭐ Adicione a senha ao payload ⭐
      }

      // Altere o endpoint se você tiver um endpoint de registro separado, como `/api/register`
      const res = await fetch('/api/registro', { // Endpoint de registro
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao registrar cliente.')
        return
      }

      // Se o registro for bem-sucedido, você pode querer logar o usuário automaticamente
      // ou apenas fechar o modal e direcioná-lo para a tela de login.
      onClose()
      // Opcional: Se quiser redirecionar para a tela de login após o registro:
      // onLoginClick();

    } catch (err) {
      console.error('[ERRO FETCH FRONTEND REGISTRO]', err)
      setErrorMsg('Erro de conexão com o servidor. Tente novamente mais tarde.')
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
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

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

            <div className="grid gap-2">
              <Label>Número</Label>
              <Input value={numero} onChange={(e) => setNumero(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label>Complemento</Label>
              <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>} {/* Exibe a mensagem de erro */}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Já tem uma conta?{' '}
            <Button variant="link" className="p-0 text-sm" onClick={onLoginClick}>
              Faça login
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}