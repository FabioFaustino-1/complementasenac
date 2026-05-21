const express = require('express');
const { getCoordenadorService, getAdminAlunoService } = require('../services/getServices');

const router = express.Router();

router.get('/coordenador/atividades', (req, res, next) => {
  try {
    res.json(getCoordenadorService().listarPendentes());
  } catch (e) {
    next(e);
  }
});

router.get('/coordenador/atividades/todas', (req, res, next) => {
  try {
    res.json(getCoordenadorService().listarTodas());
  } catch (e) {
    next(e);
  }
});

router.post('/coordenador/atividades/:id/decisao', (req, res, next) => {
  try {
    const { status = 'PENDENTE', horasAprovadas, justificativa } = req.body || {};
    const result = getCoordenadorService().decidir(
      req.params.id,
      String(status).toUpperCase(),
      typeof horasAprovadas === 'number' ? horasAprovadas : null,
      justificativa == null ? null : String(justificativa)
    );

    if (!result) return res.status(404).end();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/coordenador/resumo', (req, res, next) => {
  try {
    res.json(getCoordenadorService().resumo());
  } catch (e) {
    next(e);
  }
});

router.get('/coordenador/perfil', (req, res, next) => {
  try {
    res.json(getCoordenadorService().perfil(req.uid || '', req.email || ''));
  } catch (e) {
    next(e);
  }
});

router.get('/coordenador/alunos', (req, res, next) => {
  try {
    res.json(getAdminAlunoService().listar());
  } catch (e) {
    next(e);
  }
});

module.exports = router;

