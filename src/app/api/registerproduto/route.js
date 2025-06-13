import { db } from '@/lib/db';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      bdChaveCli,
      bdNome,
      bdDescricao,
      bdCategoria,
      bdURLIMG,
      bdPrecoAluguel,
      bdEstado = 'disponível', // valor padrão
      bdAtivo = true
    } = req.body;

    if (!bdChaveCli || !bdNome || !bdPrecoAluguel) {
      return res.status(400).json({ message: 'Campos obrigatórios: bdChaveCli, bdNome, bdPrecoAluguel' });
    }

    const [result] = await db.execute(
      `INSERT INTO tbFerramentas 
        (bdChaveCli, bdNome, bdDescricao, bdCategoria, bdURLIMG, bdPrecoAluguel, bdEstado, bdAtivo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bdChaveCli, bdNome, bdDescricao, bdCategoria, bdURLIMG, bdPrecoAluguel, bdEstado, bdAtivo]
    );

    res.status(201).json({
      message: 'Ferramenta cadastrada com sucesso!',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erro ao salvar ferramenta:', error);
    res.status(500).json({ message: 'Erro interno ao salvar ferramenta.' });
  }
});

export default router;
