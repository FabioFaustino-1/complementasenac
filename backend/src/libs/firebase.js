const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const DEFAULT_CREDENTIALS_FILE = 'pi-3-286ed-firebase-adminsdk-fbsvc-9edefa08b0.json';
const BACKEND_ROOT = path.join(__dirname, '..', '..');

let initialized = false;

function resolveCredentialsPath(configured) {
  const candidates = [];

  if (configured && String(configured).trim()) {
    const value = String(configured).trim();
    candidates.push(path.isAbsolute(value) ? value : path.join(BACKEND_ROOT, value));
  }

  candidates.push(path.join(BACKEND_ROOT, DEFAULT_CREDENTIALS_FILE));

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) return filePath;
  }

  return null;
}

function initFirebaseAdmin() {
  if (initialized) return;

  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET || 'pi-3-286ed.firebasestorage.app';

  const credentialsPath = resolveCredentialsPath(process.env.FIREBASE_CREDENTIALS_FILE);
  if (!credentialsPath) {
    console.warn(
      `[backend] Arquivo de credenciais Firebase nao encontrado. Defina FIREBASE_CREDENTIALS_FILE ou coloque ${DEFAULT_CREDENTIALS_FILE} na pasta backend/.`
    );
    return;
  }

  const raw = fs.readFileSync(credentialsPath, 'utf8');
  const serviceAccount = JSON.parse(raw);

  const options = {
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  };
  if (storageBucket && storageBucket.trim().length) {
    options.storageBucket = storageBucket.trim();
  }

  if (admin.apps.length === 0) {
    admin.initializeApp(options);
  }

  initialized = true;
  console.log(`[backend] Firebase Admin inicializado (${path.basename(credentialsPath)})`);
}

function getAdmin() {
  initFirebaseAdmin();
  return admin;
}

module.exports = { initFirebaseAdmin, getAdmin, DEFAULT_CREDENTIALS_FILE };
