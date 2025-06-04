import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_muito_secreto_para_jwt';


export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios.' }), { status: 400 });
    }

    // 1. Buscar o cliente pelo email
    const [rows] = await db.query('SELECT bdChave, bdNome, bdEmail, bdSenha FROM tbClientes WHERE bdEmail = ?', [email]);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Email ou senha inválidos.' }), { status: 401 });
    }

    const user = rows[0];

    // 2. Comparar a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.bdSenha);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Email ou senha inválidos.' }), { status: 401 });
    }

    // 3. Se a senha é válida, gerar um token JWT
    const token = jwt.sign(
      { userId: user.bdChave, email: user.bdEmail },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    return new Response(
      JSON.stringify({
        message: 'Login bem-sucedido!',
        token,
        user: { id: user.bdChave, nome: user.bdNome, email: user.bdEmail }
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error('[ERRO API LOGIN]', err);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor ao tentar fazer login.' }), { status: 500 });
  }
}