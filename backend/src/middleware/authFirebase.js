const { getAdmin } = require('../libs/firebase');

function corsHeadersFromRequest(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}

function isPublicRoute(fullPath) {
  return fullPath.includes('/api/health') || fullPath.includes('/api/config/limites');
}

function authFirebaseMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const fullPath = req.originalUrl || req.url || '';
  if (isPublicRoute(fullPath)) {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    corsHeadersFromRequest(req, res);
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  const token = header.replace('Bearer ', '').trim();
  if (!token) {
    corsHeadersFromRequest(req, res);
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  let admin;
  try {
    admin = getAdmin();
  } catch (_) {
    admin = null;
  }

  if (!admin || !admin.apps || admin.apps.length === 0) {
    corsHeadersFromRequest(req, res);
    res.status(503).json({ error: 'Firebase nao inicializado' });
    return;
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.uid = decodedToken.uid;
      req.email = decodedToken.email;
      next();
    })
    .catch(() => {
      corsHeadersFromRequest(req, res);
      res.status(401).json({ error: 'Token invalido' });
    });
}

module.exports = { authFirebaseMiddleware };
