const express = require('express');
const { getAlunoService } = require('../services/getServices');

const router = express.Router();

function alunoServiceOr503(res) {
  const alunoService = getAlunoService();
  if (!alunoService) {
    res.status(503).json({ error: 'Firebase nao inicializado' });
    return null;
  }
  return alunoService;
}

router.get('/usuario', async (req, res, next) => {
  try {
    const alunoService = alunoServiceOr503(res);
    if (!alunoService) return;

    const perfil = await alunoService.perfilResolver(req.uid, req.email);
    res.json({ uid: req.uid, email: req.email, perfil });
  } catch (error) {
    next(error);
  }
});

router.get('/aluno/perfil', async (req, res, next) => {
  try {
    const alunoService = alunoServiceOr503(res);
    if (!alunoService) return;

    const payload = await alunoService.buscarPerfil(req.uid || '', req.email || '');
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/aluno/resumo', async (req, res, next) => {
  try {
    const alunoService = alunoServiceOr503(res);
    if (!alunoService) return;

    res.json(await alunoService.buscarResumo(req.uid || '', req.email || ''));
  } catch (error) {
    next(error);
  }
});

router.get('/aluno/atividades/recentes', async (req, res, next) => {
  try {
    const alunoService = alunoServiceOr503(res);
    if (!alunoService) return;

    res.json(await alunoService.listarRecentes(3, req.uid || '', req.email || ''));
  } catch (error) {
    next(error);
  }
});

router.get('/aluno/atividades', async (req, res, next) => {
  try {
    const alunoService = alunoServiceOr503(res);
    if (!alunoService) return;

    res.json(await alunoService.listarHistorico(req.uid || '', req.email || ''));
  } catch (error) {
    next(error);
  }
});

router.post('/aluno/atividades', async (req, res, next) => {
  try {
    const alunoService = alunoServiceOr503(res);
    if (!alunoService) return;

    const created = await alunoService.submeterAtividade(req.body || {}, req.uid || '', req.email || '');
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
