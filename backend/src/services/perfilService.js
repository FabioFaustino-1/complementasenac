const { IllegalArgumentError } = require('../middleware/errorHandler');

class PerfilService {
  constructor(firestoreService) {
    this.firestoreService = firestoreService;
  }

  async resolverPerfil(uid, email) {
    const byUid = await this.firestoreService.buscarUsuarioPorUid(uid);
    const doc = byUid || (await this.firestoreService.buscarUsuarioPorEmail(email));
    if (!doc) throw new IllegalArgumentError('Usuario nao encontrado no banco de dados.');

    const role = doc.get('role');
    return this.normalizarRole(role);
  }

  normalizarRole(role) {
    if (!role || !String(role).trim()) throw new IllegalArgumentError('Usuario sem role configurada no banco.');
    const normalizado = String(role).trim().toLowerCase();
    if (normalizado === 'superadmin') return 'admin';
    if (['coordenador', 'aluno', 'admin'].includes(normalizado)) return normalizado;
    throw new IllegalArgumentError('Role invalida no banco: ' + role);
  }
}

module.exports = PerfilService;

