class StandardError {
  constructor({ timestamp, status, error, message, path }) {
    this.timestamp = timestamp;
    this.status = status;
    this.error = error;
    this.message = message;
    this.path = path;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json(
    new StandardError({
      timestamp: Date.now(),
      status: 404,
      error: 'Not Found',
      message: 'Rota nao encontrada',
      path: req.originalUrl
    })
  );
}

function errorHandler(err, req, res, next) {
  if (!err) {
    next();
    return;
  }

  if (err && err.name === 'IllegalArgumentError') {
    res.status(400).json(
      new StandardError({
        timestamp: Date.now(),
        status: 400,
        error: 'Dados invalidos',
        message: err.message,
        path: req.originalUrl
      })
    );
    return;
  }

  console.error('[backend]', err.message || err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json(
    new StandardError({
      timestamp: Date.now(),
      status,
      error: status >= 500 ? 'Erro interno' : 'Erro',
      message: err.message || 'Erro interno no servidor',
      path: req.originalUrl
    })
  );
}

class IllegalArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IllegalArgumentError';
  }
}

module.exports = { errorHandler, notFoundHandler, IllegalArgumentError, StandardError };

