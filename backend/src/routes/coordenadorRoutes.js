const express = require('express');
const { getCoordenadorService, getAdminAlunoService } = require('../services/getServices');

const router = express.Router();

function coordenadorServiceOr503(res) {
  const service = getCoordenadorService();
  if (!service) {
    res.status(503).json({ error: 'Firebase nao inicializado' });
    return null;
  }
  return service;
}

router.get('/coordenador/atividades', async (req, res, next) => {
  try {
    const service = coordenadorServiceOr503(res);
    if (!service) return;

    res.json(await service.listarPendentes());
  } catch (error) {
    next(error);
  }
});

router.get('/coordenador/atividades/todas', async (req, res, next) => {
  try {
    const service = coordenadorServiceOr503(res);
    if (!service) return;

    res.json(await service.listarTodas());
  } catch (error) {
    next(error);
  }
});

router.post('/coordenador/atividades/:id/decisao', async (req, res, next) => {
  try {
    const service = coordenadorServiceOr503(res);
    if (!service) return;

    const { status = 'PENDENTE', horasAprovadas, justificativa } = req.body || {};
    const result = await service.decidir(
      req.params.id,
      String(status).toUpperCase(),
      typeof horasAprovadas === 'number' ? horasAprovadas : null,
      justificativa == null ? null : String(justificativa)
    );

    if (!result) return res.status(404).end();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/coordenador/resumo', async (req, res, next) => {
  try {
    const service = coordenadorServiceOr503(res);
    if (!service) return;

    res.json(await service.resumo());
  } catch (error) {
    next(error);
  }
});

router.get('/coordenador/perfil', async (req, res, next) => {
  try {
    const service = coordenadorServiceOr503(res);
    if (!service) return;

    res.json(await service.perfil(req.uid || '', req.email || ''));
  } catch (error) {
    next(error);
  }
});

router.get('/coordenador/alunos', async (req, res, next) => {
  try {
    const adminAlunoService = getAdminAlunoService();
    if (!adminAlunoService) {
      return res.status(503).json({ error: 'Firebase nao inicializado' });
    }

    res.json(await adminAlunoService.listar());
  } catch (error) {
    next(error);
  }
});

router.post('/coordenador/solicitacoes-exclusao', async (req, res, next) => {
  try {
    const service = coordenadorServiceOr503(res);
    if (!service) return;

    const { alunoId, nomeAluno } = req.body || {};
    if (!alunoId || !nomeAluno) {
      return res.status(400).json({ error: 'alunoId e nomeAluno são obrigatórios.' });
    }

    const id = await service.solicitarExclusao(
      alunoId,
      nomeAluno,
      req.uid || '',
      req.email || ''
    );
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

