require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initFirebaseAdmin } = require('./libs/firebase');
const { authFirebaseMiddleware } = require('./middleware/authFirebase');
const { roleGuard } = require('./middleware/roleGuard');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const coordenadorRoutes = require('./routes/coordenadorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

initFirebaseAdmin();

app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origem nao permitida pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type']
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'complementasenac-api' });
});

app.use('/api', authFirebaseMiddleware);
app.use('/api', authRoutes);
app.use('/api', roleGuard);
app.use('/api', alunoRoutes);
app.use('/api', coordenadorRoutes);
app.use('/api', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT) || 8080;
const server = app.listen(port, () => {
  console.log(`[backend] listening on :${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `[backend] Porta ${port} ja esta em uso. Encerre o processo anterior ou defina PORT com outro valor no .env.`
    );
    console.error(`[backend] Windows: netstat -ano | findstr :${port}  e depois  taskkill /PID <pid> /F`);
    process.exit(1);
  }

  console.error('[backend] Falha ao iniciar servidor:', error.message);
  process.exit(1);
});
