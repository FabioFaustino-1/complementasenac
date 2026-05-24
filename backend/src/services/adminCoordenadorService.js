const { IllegalArgumentError } = require('../middleware/errorHandler');
const { rolesEquivalentes } = require('../utils/roleUtils');

class AdminCoordenadorService {
  constructor(firestoreService, firebaseUserProvisioningService) {
    this.firestoreService = firestoreService;
    this.firebaseUserProvisioningService = firebaseUserProvisioningService;
  }

  async listar() {
    const docs = await this.firestoreService.listarUsuariosPorRole('COORDENADOR');
    return docs.map((d) => this.paraModel(d));
  }

  async buscarPorId(id) {
    const doc = await this.firestoreService.buscarUsuarioPorId(id);
    if (!doc) return null;
    if (!rolesEquivalentes(doc.get('role'), 'COORDENADOR')) return null;
    return this.paraModel(doc);
  }

  async criar(coordenador) {
    this.validar(coordenador);
    const uid = await this.firebaseUserProvisioningService.upsertUser(
      null,
      coordenador.email,
      coordenador.nome,
      this.senhaPadraoCoordenador(coordenador.email)
    );
    await this.firestoreService.salvarUsuario(uid, this.payload(uid, coordenador));
    return await this.buscarPorId(uid);
  }

  async atualizar(id, coordenador) {
    this.validar(coordenador);
    const atual = await this.buscarPorId(id);
    if (!atual) return null;

    await this.firebaseUserProvisioningService.upsertUser(
      id,
      coordenador.email,
      coordenador.nome,
      this.senhaPadraoCoordenador(coordenador.email)
    );

    await this.firestoreService.salvarUsuario(id, this.payload(id, coordenador));
    return await this.buscarPorId(id);
  }

  async remover(id) {
    const atual = await this.buscarPorId(id);
    if (!atual) return false;
    await this.firebaseUserProvisioningService.deleteByUid(id);
    await this.firestoreService.removerUsuario(id);
    return true;
  }

  validar(coordenador) {
    if (!coordenador || this.isBlank(coordenador.nome) || this.isBlank(coordenador.email)) {
      throw new IllegalArgumentError('Nome e e-mail do coordenador sao obrigatorios.');
    }
  }

  payload(uid, c) {
    return {
      uid,
      nome: String(c.nome).trim(),
      email: String(c.email).trim().toLowerCase(),
      role: 'COORDENADOR',
      departamento: c.departamento == null ? '' : String(c.departamento).trim(),
      status: c.status == null ? 'Ativo' : String(c.status).trim(),
      cursos: c.cursos == null ? [] : c.cursos,
      vinculo: {}
    };
  }

  paraModel(doc) {
    return {
      id: doc.id,
      nome: this.texto(doc.get('nome')),
      email: this.texto(doc.get('email')),
      departamento: this.texto(doc.get('departamento')),
      status: this.texto(doc.get('status')),
      cursos: doc.get('cursos') || []
    };
  }

  senhaPadraoCoordenador(email) {
    const normalized = email == null ? '' : String(email).trim().toLowerCase();
    const atIndex = normalized.indexOf('@');
    const base = atIndex > 0 ? normalized.substring(0, atIndex) : normalized;
    if (!base.trim()) throw new IllegalArgumentError('E-mail invalido para gerar senha padrao do coordenador.');
    return base + '2026';
  }

  isBlank(v) {
    return v == null || String(v).trim().length === 0;
  }

  texto(v) {
    return v == null ? '' : String(v);
  }
}

module.exports = AdminCoordenadorService;

