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

function authFirebaseMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const header = req.headers.authorization;
  const fullPath = req.originalUrl || req.url || '';
  const isAuthRoute = fullPath.startsWith('/api/auth/') || fullPath.includes('/api/auth/');


  if (header && header.startsWith('Bearer ')) {
    const token = header.replace('Bearer ', '').trim();
    if (token) {
      // Se o Firebase nao foi inicializado (ex.: FIREBASE_CREDENTIALS_FILE ausente), nao podemos validar token.
      // Para manter o contrato e evitar 500, nas rotas /api/auth/* retornamos 401 controlado.
      let admin;
      try {
        admin = getAdmin();
      } catch (e) {
        admin = null;
      }

      const isFirebaseReady = admin && admin.apps && admin.apps.length > 0;

      if (!isFirebaseReady) {
        if (isAuthRoute) {
          corsHeadersFromRequest(req, res);
          res.status(401).json({ error: 'Token ausente' });
          return;
        }
        // fora de /api/auth/*: nao bloquear.
        next();
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
          if (isAuthRoute) {
            corsHeadersFromRequest(req, res);
            res.status(401).json({ error: 'Token invalido' });
            return;
          }
          // comportamento do Java: para rotas fora de /api/auth/*, não bloquear
          next();
        });
      return;
    }
  }

  // Se for rota /api/auth/* e nao veio token/uid, retornar 401
  if (isAuthRoute && !req.uid) {
    corsHeadersFromRequest(req, res);
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  next();
}

module.exports = { authFirebaseMiddleware };

