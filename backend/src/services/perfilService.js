const { IllegalArgumentError } = require('../middleware/errorHandler');
const { roleFirestoreParaPerfil } = require('../utils/roleUtils');

class PerfilService {
  constructor(firestoreService) {
    this.firestoreService = firestoreService;
  }

  async resolverPerfil(uid, email) {
    const doc = await this.buscarDocumentoUsuario(uid, email);
    const role = doc.get('role');
    return this.normalizarRole(role);
  }

  async resolverPerfilCompleto(uid, email) {
    const doc = await this.buscarDocumentoUsuario(uid, email);
    const role = doc.get('role');

    return {
      uid: doc.id,
      email: doc.get('email') || email,
      nome: doc.get('nome') || '',
      perfil: this.normalizarRole(role)
    };
  }

  async buscarDocumentoUsuario(uid, email) {
    const byUid = await this.firestoreService.buscarUsuarioPorUid(uid);
    const doc = byUid || (await this.firestoreService.buscarUsuarioPorEmail(email));
    if (!doc) throw new IllegalArgumentError('Usuario nao encontrado no banco de dados.');
    return doc;
  }

  normalizarRole(role) {
    if (!role || !String(role).trim()) throw new IllegalArgumentError('Usuario sem role configurada no banco.');
    const perfil = roleFirestoreParaPerfil(role);
    if (!['admin', 'coordenador', 'aluno'].includes(perfil)) {
      throw new IllegalArgumentError('Role invalida no banco: ' + role);
    }
    return perfil;
  }
}

module.exports = PerfilService;

