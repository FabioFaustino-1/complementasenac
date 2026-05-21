const admin = require('firebase-admin');
const fs = require('fs');

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return;

  const credentialsFile = process.env.FIREBASE_CREDENTIALS_FILE;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!credentialsFile) {
    // Mantemos o servidor iniciando para testes locais.
    // Os endpoints que dependem do Firebase falharão com erro claro quando acionados.
    console.warn('[backend-node] Missing FIREBASE_CREDENTIALS_FILE env var - Firebase admin nao inicializado.');
    return;
  }


  const raw = fs.readFileSync(credentialsFile, 'utf8');
  const serviceAccount = JSON.parse(raw);

  const options = {
    credential: admin.credential.cert(serviceAccount)
  };
  if (storageBucket && storageBucket.trim().length) {
    options.storageBucket = storageBucket.trim();
  }

  if (admin.apps.length === 0) {
    admin.initializeApp(options);
  }

  initialized = true;
}

function getAdmin() {
  initFirebaseAdmin();
  return admin;
}

module.exports = { initFirebaseAdmin, getAdmin };

