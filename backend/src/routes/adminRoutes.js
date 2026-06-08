const express = require('express');
const { getAdminAlunoService, getAdminCursoService, getAdminCoordenadorService } = require('../services/getServices');

const router = express.Router();

function serviceOr503(res, getter) {
  const service = getter();
  if (!service) {
    res.status(503).json({ error: 'Firebase nao inicializado' });
    return null;
  }
  return service;
}

router.get('/admin/alunos', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminAlunoService);
    if (!service) return;
    res.json(await service.listar());
  } catch (error) {
    next(error);
  }
});

router.get('/admin/alunos/:id', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminAlunoService);
    if (!service) return;

    const doc = await service.buscarPorId(req.params.id);
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (error) {
    next(error);
  }
});

router.post('/admin/alunos', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminAlunoService);
    if (!service) return;

    const a = req.body || {};
    const created = await service.criar(a.nome, a.email, a.matricula, a.curso);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put('/admin/alunos/:id', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminAlunoService);
    if (!service) return;

    const a = req.body || {};
    const updated = await service.atualizar(req.params.id, a.nome, a.email, a.matricula, a.curso);
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/alunos/:id', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminAlunoService);
    if (!service) return;

    const ok = await service.remover(req.params.id);
    if (!ok) return res.status(404).end();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/admin/coordenadores', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCoordenadorService);
    if (!service) return;
    res.json(await service.listar());
  } catch (error) {
    next(error);
  }
});

router.get('/admin/coordenadores/:id', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCoordenadorService);
    if (!service) return;

    const doc = await service.buscarPorId(req.params.id);
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (error) {
    next(error);
  }
});

router.post('/admin/coordenadores', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCoordenadorService);
    if (!service) return;

    const created = await service.criar(req.body || {});
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put('/admin/coordenadores/:id', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCoordenadorService);
    if (!service) return;

    const updated = await service.atualizar(req.params.id, req.body || {});
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/coordenadores/:id', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCoordenadorService);
    if (!service) return;

    const ok = await service.remover(req.params.id);
    if (!ok) return res.status(404).end();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/admin/cursos', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCursoService);
    if (!service) return;
    res.json(await service.listar());
  } catch (error) {
    next(error);
  }
});

router.get('/admin/cursos/:idCurso', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCursoService);
    if (!service) return;

    const doc = await service.buscarPorId(req.params.idCurso);
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (error) {
    next(error);
  }
});

router.post('/admin/cursos', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCursoService);
    if (!service) return;

    const created = await service.criar(req.body || {});
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put('/admin/cursos/:idCurso', async (req, res, next) => {
  try {
    const service = serviceOr503(res, getAdminCursoService);
    if (!service) return;

    const updated = await service.atualizar(req.params.idCurso, req.body || {});
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get('/admin/solicitacoes-exclusao', async (req, res, next) => {
  try {
    const adminAlunoService = require('../services/getServices').getAdminAlunoService();
    if (!adminAlunoService) return res.status(503).json({ error: 'Firebase nao inicializado' });

    const docs = await adminAlunoService.firestoreService.listarSolicitacoesExclusao('PENDENTE');
    const lista = docs.map((d) => ({
      id: d.id,
      alunoId: d.get('alunoId'),
      nomeAluno: d.get('nomeAluno'),
      uidCoordenador: d.get('uidCoordenador'),
      emailCoordenador: d.get('emailCoordenador'),
      status: d.get('status'),
      criadoEm: d.get('criadoEm'),
    }));
    res.json(lista);
  } catch (error) {
    next(error);
  }
});

router.post('/admin/solicitacoes-exclusao/:id/decisao', async (req, res, next) => {
  try {
    const { getAdminAlunoService } = require('../services/getServices');
    const adminService = getAdminAlunoService();
    if (!adminService) return res.status(503).json({ error: 'Firebase nao inicializado' });

    const { decisao } = req.body || {};
    if (!['APROVADO', 'RECUSADO'].includes(decisao)) {
      return res.status(400).json({ error: 'decisao deve ser APROVADO ou RECUSADO.' });
    }

    const doc = await adminService.firestoreService.buscarSolicitacaoExclusaoPorId(req.params.id);
    if (!doc) return res.status(404).end();

    if (decisao === 'APROVADO') {
      const alunoId = doc.get('alunoId');
      const ok = await getAdminAlunoService().remover(alunoId);
      if (!ok) return res.status(404).json({ error: 'Aluno nao encontrado para exclusao.' });
    }

    await adminService.firestoreService.atualizarSolicitacaoExclusao(req.params.id, {
      status: decisao,
      decididoEm: new Date().toISOString(),
    });

    res.json({ status: decisao });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

