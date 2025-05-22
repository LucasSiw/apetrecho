"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Verificar se há um usuário salvo no localStorage ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Simulação de login - em um app real, você faria uma chamada à API
    // e validaria as credenciais no backend
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          name: email.split("@")[0], // Usando parte do email como nome para simulação
          email,
        }

        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        resolve()
      }, 1000) // Simulando um delay de rede
    })
  }

  const register = async (name: string, email: string, password: string) => {
    // Simulação de registro - em um app real, você faria uma chamada à API
    // para criar um novo usuário no backend
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          name,
          email,
        }

        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        resolve()
      }, 1000) // Simulando um delay de rede
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
