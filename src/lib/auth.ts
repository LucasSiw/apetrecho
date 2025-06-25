import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/database"

export interface UserData {
  bdChave: number
  bdNome: string
  bdEmail: string
  bdTelefone?: string
  bdcpf?: string
  bdDTNASCIMENTO?: Date
  bdLogradouro: string
  bdNumero: string
  bdComplemento?: string
  bdBairro: string
  bdCidade: string
  bdEstado: string
  bdCEP: string
}

export interface RegisterData extends Omit<UserData, "bdChave"> {
  bdSenha: string
}

export interface LoginData {
  bdEmail: string
  bdSenha: string
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Gerar JWT token
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" })
}

// Verificar JWT token
export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: number }
  } catch {
    return null
  }
}

// Registrar usuário
export async function registerUser(userData: RegisterData): Promise<UserData> {
  const hashedPassword = await hashPassword(userData.bdSenha)

  const user = await prisma.tbClientes.create({
    data: {
      ...userData,
      bdSenha: hashedPassword,
    },
    select: {
      bdChave: true,
      bdNome: true,
      bdEmail: true,
      bdTelefone: true,
      bdcpf: true,
      bdDTNASCIMENTO: true,
      bdLogradouro: true,
      bdNumero: true,
      bdComplemento: true,
      bdBairro: true,
      bdCidade: true,
      bdEstado: true,
      bdCEP: true,
    },
  })

  // Log da atividade
  await logActivity(user.bdChave, "Registro de usuário", null)

  return {
    ...user,
    bdTelefone: user.bdTelefone ?? undefined,
    bdcpf: user.bdcpf ?? undefined,
    bdDTNASCIMENTO: user.bdDTNASCIMENTO ?? undefined,
    bdComplemento: user.bdComplemento ?? undefined,
  }
}

// Login do usuário
export async function loginUser(loginData: LoginData): Promise<{ user: UserData; token: string } | null> {
  const user = await prisma.tbClientes.findUnique({
    where: { bdEmail: loginData.bdEmail },
    select: {
      bdChave: true,
      bdNome: true,
      bdEmail: true,
      bdTelefone: true,
      bdcpf: true,
      bdDTNASCIMENTO: true,
      bdLogradouro: true,
      bdNumero: true,
      bdComplemento: true,
      bdBairro: true,
      bdCidade: true,
      bdEstado: true,
      bdCEP: true,
      bdSenha: true,
      bdAtivo: true,
    },
  })

  if (!user || !user.bdAtivo) {
    return null
  }

  const isValidPassword = await verifyPassword(loginData.bdSenha, user.bdSenha)
  if (!isValidPassword) {
    return null
  }

  const token = generateToken(user.bdChave)

  // Log da atividade
  await logActivity(user.bdChave, "Login realizado", null)

  // Remove a senha do retorno
  const { bdSenha, bdAtivo, ...userWithoutPassword } = user

  // Convert nullable fields to undefined if null
  const userData: UserData = {
    ...userWithoutPassword,
    bdTelefone: userWithoutPassword.bdTelefone ?? undefined,
    bdcpf: userWithoutPassword.bdcpf ?? undefined,
    bdDTNASCIMENTO: userWithoutPassword.bdDTNASCIMENTO ?? undefined,
    bdComplemento: userWithoutPassword.bdComplemento ?? undefined,
  }

  return {
    user: userData,
    token,
  }
}

// Buscar usuário por ID
export async function getUserById(userId: number): Promise<UserData | null> {
  const user = await prisma.tbClientes.findUnique({
    where: { bdChave: userId, bdAtivo: true },
    select: {
      bdChave: true,
      bdNome: true,
      bdEmail: true,
      bdTelefone: true,
      bdcpf: true,
      bdDTNASCIMENTO: true,
      bdLogradouro: true,
      bdNumero: true,
      bdComplemento: true,
      bdBairro: true,
      bdCidade: true,
      bdEstado: true,
      bdCEP: true,
    },
  })

  if (!user) return null

  return {
    ...user,
    bdTelefone: user.bdTelefone ?? undefined,
    bdcpf: user.bdcpf ?? undefined,
    bdDTNASCIMENTO: user.bdDTNASCIMENTO ?? undefined,
    bdComplemento: user.bdComplemento ?? undefined,
  }
}

// Log de atividades
export async function logActivity(userId: number, action: string, request: Request | null): Promise<void> {
  let ipAddress = null
  let userAgent = null

  if (request) {
    ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    userAgent = request.headers.get("user-agent") || "unknown"
  }

  await prisma.tbLogAtividades.create({
    data: {
      bdChaveCli: userId,
      bdAcao: action,
      bdIPOrigm: ipAddress,
      bdNavegador: userAgent,
    },
  })
}
