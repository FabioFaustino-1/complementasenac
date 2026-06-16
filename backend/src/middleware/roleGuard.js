const { getPerfilService } = require('../services/getServices');

function resolveRequiredRole(path) {
  if (path.startsWith('/aluno') || path === '/usuario') return 'aluno';
  if (path.startsWith('/coordenador')) return 'coordenador';
  if (path.startsWith('/admin')) return 'admin';
  return null;
}

function roleGuard(req, res, next) {
  const path = req.path || '';

  if (path.startsWith('/auth') || path === '/health' || path.startsWith('/config')) {
    next();
    return;
  }

  const requiredRole = resolveRequiredRole(path);
  if (!requiredRole) {
    next();
    return;
  }

  if (!req.uid || !req.email) {
    res.status(401).json({ error: 'Token ausente ou invalido' });
    return;
  }

  const perfilService = getPerfilService();
  if (!perfilService) {
    res.status(503).json({ error: 'Firebase nao inicializado' });
    return;
  }

  perfilService
    .resolverPerfil(req.uid, req.email)
    .then((role) => {
      if (role !== requiredRole) {
        res.status(403).json({ error: 'Acesso negado para este perfil' });
        return;
      }
      req.role = role;
      next();
    })
    .catch(next);
}

module.exports = { roleGuard, resolveRequiredRole };
