require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initFirebaseAdmin } = require('./libs/firebase');
const { authFirebaseMiddleware } = require('./middleware/authFirebase');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const coordenadorRoutes = require('./routes/coordenadorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

initFirebaseAdmin();

// Garanta headers JSON consistentes
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', '*']
  })
);

// API prefix
app.use('/api', authFirebaseMiddleware);

app.use('/api', authRoutes);
app.use('/api', alunoRoutes);
app.use('/api', coordenadorRoutes);
app.use('/api', adminRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`[backend-node] listening on :${port}`);
});

