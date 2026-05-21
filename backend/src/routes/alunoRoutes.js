const express = require('express');
const { getAlunoService } = require('../services/getServices');

const router = express.Router();

router.get('/usuario', (req, res, next) => {
  try {
    const uid = req.uid;
    const email = req.email;
    const perfil = getAlunoService().perfilResolver(uid, email);
    res.json({ uid, email, perfil });
  } catch (e) {
    next(e);
  }
});

router.get('/aluno/perfil', (req, res, next) => {
  try {
    const alunoService = getAlunoService();
    if (!alunoService || typeof alunoService.buscarPerfil !== 'function') {
      return res.status(503).json({ error: 'Firebase nao inicializado' });
    }
    const payload = alunoService.buscarPerfil(req.uid || '', req.email || '');
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

router.get('/aluno/resumo', (req, res, next) => {
  try {
    res.json(getAlunoService().buscarResumo(req.uid || '', req.email || ''));
  } catch (e) {
    next(e);
  }
});

router.get('/aluno/atividades/recentes', (req, res, next) => {
  try {
    res.json(getAlunoService().listarRecentes(3, req.uid || '', req.email || ''));
  } catch (e) {
    next(e);
  }
});

router.get('/aluno/atividades', (req, res, next) => {
  try {
    res.json(getAlunoService().listarHistorico(req.uid || '', req.email || ''));
  } catch (e) {
    next(e);
  }
});

router.post('/aluno/atividades', (req, res, next) => {
  try {
    const created = getAlunoService().submeterAtividade(req.body || {}, req.uid || '', req.email || '');
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

