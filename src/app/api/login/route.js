import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto'

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('🔍 Login body recebido:', body)

    const { email, password } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios.' }),
        { status: 400 }
      )
    }

    const [rows] = await db.query(
      'SELECT bdChave, bdNome, bdEmail, bdSenha FROM tbClientes WHERE bdEmail = ?',
      [email]
    )

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Email inválido.' }),
        { status: 401 }
      )
    }

    const user = rows[0]

    const isPasswordValid = await bcrypt.compare(password, user.bdSenha)

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: 'Senha inválida.' }),
        { status: 401 }
      )
    }

    const token = jwt.sign(
      {
        userId: user.bdChave,
        email: user.bdEmail,
        nome: user.bdNome,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    return new Response(
      JSON.stringify({
        message: 'Login bem-sucedido!',
        token,
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error('[ERRO API LOGIN]', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor ao tentar fazer login.' }),
      { status: 500 }
    )
  }
}
