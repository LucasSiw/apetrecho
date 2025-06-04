import { db } from '@/lib/db';
import bcrypt from 'bcryptjs'; 

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('[DADOS DE REGISTRO RECEBIDOS]', data);

    const {
      nome,
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
      senha, // A senha em texto puro recebida do frontend
    } = data;

    // ✅ Validação mínima de campos obrigatórios
    const camposObrigatorios = [nome, email, cpf, logradouro, numero, bairro, cidade, estado, cep, senha];
    const nomesCampos = ['nome', 'email', 'cpf', 'logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'password'];

    for (let i = 0; i < camposObrigatorios.length; i++) {
      if (!camposObrigatorios[i]) {
        return new Response(
          JSON.stringify({ error: `Campo obrigatório ausente: ${nomesCampos[i]}` }),
          { status: 400 }
        );
      }
    }

    // ✅ Conversão de nascimento "DD/MM/AAAA" → Date (YYYY-MM-DD)
    let nascimentoConvertido = null;
    try {
      if (nascimento && nascimento.includes('/')) {
        const [dia, mes, ano] = nascimento.split('/');
        nascimentoConvertido = new Date(`${ano}-${mes}-${dia}`);
        if (isNaN(nascimentoConvertido.getTime())) throw new Error('Data inválida');
      }
    } catch (err) {
      console.error('[DATA INVÁLIDA]', nascimento);
      return new Response(JSON.stringify({ error: 'Data de nascimento inválida' }), { status: 400 });
    }

    // ⭐ HASH DA SENHA ANTES DE ARMAZENAR ⭐
    // O '10' é o 'saltRounds', que determina a força do hash.
    // Valores mais altos são mais seguros, mas levam mais tempo para processar.
    const senhaHash = await bcrypt.hash(senha, 10);
    console.log('[SENHA HASH GERADA]', senhaHash);

    // ✅ Query SQL - Agora inclui bdSenha
    const sql = `
      INSERT INTO tbClientes (
        bdNome, bdEmail, bdTelefone, bdcpf, bdDTNASCIMENTO,
        bdLogradouro, bdNumero, bdComplemento, bdBairro,
        bdCidade, bdEstado, bdCEP, bdSenha
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nome,
      email,
      telefone || '',
      cpf,
      nascimentoConvertido,
      logradouro,
      numero,
      complemento || '',
      bairro,
      cidade,
      estado,
      cep,
      senhaHash, // ⭐ Usa a senha HASH aqui ⭐
    ];

    // ✅ Execução
    const [result] = await db.query(sql, values);
    console.log('[CLIENTE CADASTRADO]', result);

    return new Response(JSON.stringify({ success: true, message: 'Cliente cadastrado com sucesso!' }), { status: 201 });
  } catch (err) {
    console.error('[ERRO GERAL API DE REGISTRO DE CLIENTES]', err);

    // ⚠️ Erros MySQL específicos
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('bdEmail')) {
        return new Response(JSON.stringify({ error: 'Email já cadastrado.' }), { status: 409 });
      }
      if (err.message.includes('bdcpf')) {
        return new Response(JSON.stringify({ error: 'CPF já cadastrado.' }), { status: 409 });
      }
    }

    // 🛑 Retorno padrão
    return new Response(
      JSON.stringify({ error: 'Erro interno ao cadastrar cliente', debug: err.message }),
      { status: 500 }
    );
  }
}