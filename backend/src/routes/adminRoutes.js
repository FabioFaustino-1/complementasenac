const express = require('express');
const { getAdminAlunoService, getAdminCursoService, getAdminCoordenadorService } = require('../services/getServices');

const router = express.Router();

// Alunos Admin
router.get('/admin/alunos', (req, res, next) => {
  try {
    res.json(getAdminAlunoService().listar());
  } catch (e) {
    next(e);
  }
});

router.get('/admin/alunos/:id', (req, res, next) => {
  try {
    const doc = getAdminAlunoService().buscarPorId(req.params.id);
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.post('/admin/alunos', (req, res, next) => {
  try {
    const a = req.body || {};
    const created = getAdminAlunoService().criar(a.nome, a.email, a.matricula, a.curso);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put('/admin/alunos/:id', (req, res, next) => {
  try {
    const a = req.body || {};
    const updated = getAdminAlunoService().atualizar(req.params.id, a.nome, a.email, a.matricula, a.curso);
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete('/admin/alunos/:id', (req, res, next) => {
  try {
    const ok = getAdminAlunoService().remover(req.params.id);
    if (!ok) return res.status(404).end();
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// Coordenadores Admin
router.get('/admin/coordenadores', (req, res, next) => {
  try {
    res.json(getAdminCoordenadorService().listar());
  } catch (e) {
    next(e);
  }
});

router.get('/admin/coordenadores/:id', (req, res, next) => {
  try {
    const doc = getAdminCoordenadorService().buscarPorId(req.params.id);
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.post('/admin/coordenadores', (req, res, next) => {
  try {
    const c = req.body || {};
    const created = getAdminCoordenadorService().criar(c);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put('/admin/coordenadores/:id', (req, res, next) => {
  try {
    const c = req.body || {};
    const updated = getAdminCoordenadorService().atualizar(req.params.id, c);
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete('/admin/coordenadores/:id', (req, res, next) => {
  try {
    const ok = getAdminCoordenadorService().remover(req.params.id);
    if (!ok) return res.status(404).end();
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// Cursos Admin
router.get('/admin/cursos', (req, res, next) => {
  try {
    res.json(getAdminCursoService().listar());
  } catch (e) {
    next(e);
  }
});

router.get('/admin/cursos/:idCurso', (req, res, next) => {
  try {
    const doc = getAdminCursoService().buscarPorId(req.params.idCurso);
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.post('/admin/cursos', (req, res, next) => {
  try {
    const created = getAdminCursoService().criar(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put('/admin/cursos/:idCurso', (req, res, next) => {
  try {
    const updated = getAdminCursoService().atualizar(req.params.idCurso, req.body || {});
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

