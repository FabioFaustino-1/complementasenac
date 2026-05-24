// Instancia unica por processo: evita re-criar clientes.
const { getAdmin } = require('../libs/firebase');

const FirestoreService = require('./firestoreService');
const FileUploadService = require('./fileUploadService');
const PerfilService = require('./perfilService');
const FirebaseUserProvisioningService = require('./firebaseUserProvisioningService');
const EmailNotificationService = require('./emailNotificationService');

const AlunoService = require('./alunoService');
const CoordenadorService = require('./coordenadorService');
const AdminAlunoService = require('./adminAlunoService');
const AdminCoordenadorService = require('./adminCoordenadorService');
const AdminCursoService = require('./adminCursoService');

let services;

function ensure() {
  const admin = getAdmin();
  const firebaseReady = admin && admin.apps != null && admin.apps.length > 0;

  if (services?.firestoreService) return services;

  if (!firebaseReady) {
    if (!services) {
      services = {
        firestoreService: null,
        fileUploadService: null,
        firebaseUserProvisioningService: null,
        emailNotificationService: new EmailNotificationService(),
        perfilService: null,
        alunoService: null,
        coordenadorService: null,
        adminAlunoService: null,
        adminCoordenadorService: null,
        adminCursoService: null
      };
    }
    return services;
  }

  const firestoreService = new FirestoreService(admin);
  const fileUploadService = new FileUploadService(admin);
  const firebaseUserProvisioningService = new FirebaseUserProvisioningService(admin);

  const emailNotificationService = new EmailNotificationService();

  const perfilService = new PerfilService(firestoreService);

  const alunoService = new AlunoService(firestoreService, fileUploadService);
  alunoService.setPerfilResolver((uid, email) => perfilService.resolverPerfil(uid, email));

  const coordenadorService = new CoordenadorService(firestoreService, emailNotificationService);


  const adminAlunoService = new AdminAlunoService(firestoreService, firebaseUserProvisioningService);
  const adminCoordenadorService = new AdminCoordenadorService(firestoreService, firebaseUserProvisioningService);
  const adminCursoService = new AdminCursoService(firestoreService);

  services = {
    firestoreService,
    fileUploadService,
    firebaseUserProvisioningService,
    emailNotificationService,
    perfilService,
    alunoService,
    coordenadorService,
    adminAlunoService,
    adminCoordenadorService,
    adminCursoService
  };
  return services;
}

module.exports = {
  // usado pelos controllers/routes
  getPerfilService: () => ensure().perfilService,
  getAlunoService: () => ensure().alunoService,
  getCoordenadorService: () => ensure().coordenadorService,
  getAdminAlunoService: () => ensure().adminAlunoService,
  getAdminCoordenadorService: () => ensure().adminCoordenadorService,
  getAdminCursoService: () => ensure().adminCursoService
};



