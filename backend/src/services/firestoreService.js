const { IllegalArgumentError } = require('../middleware/errorHandler');
const { rolesEquivalentes } = require('../utils/roleUtils');

class FirestoreService {
  constructor(admin) {
    this.admin = admin;
    this.db = admin.firestore();
    this.COLLECTION_USUARIOS = 'Usuarios';
    this.COLLECTION_USUARIOS_LEGACY = 'usuarios';
    this.COLLECTION_SOLICITACOES = 'Solicitacoes';
    this.COLLECTION_CURSOS = 'Cursos';
  }

  async buscarUsuarioPorUid(uid) {
    if (!uid || !uid.trim()) return null;
    const u = uid.trim();

    const docPrincipal = await this.db.collection(this.COLLECTION_USUARIOS).doc(u).get();
    if (docPrincipal.exists) return docPrincipal;

    const docLegacy = await this.db.collection(this.COLLECTION_USUARIOS_LEGACY).doc(u).get();
    if (docLegacy.exists) return docLegacy;

    const byCampoPrincipal = await this.buscarUsuarioPorCampoUid(this.COLLECTION_USUARIOS, u);
    if (byCampoPrincipal) return byCampoPrincipal;

    return this.buscarUsuarioPorCampoUid(this.COLLECTION_USUARIOS_LEGACY, u);
  }

  async buscarUsuarioPorCampoUid(collection, uid) {
    const snap = await this.db.collection(collection).where('uid', '==', uid).limit(1).get();
    if (!snap.empty) return snap.docs[0];
    return null;
  }

  async buscarUsuarioPorEmail(email) {
    if (!email || !email.trim()) return null;
    const alvo = email.trim().toLowerCase();

    // Java faz limit(200) e varre. Aqui faremos o mesmo.
    const collections = [this.COLLECTION_USUARIOS, this.COLLECTION_USUARIOS_LEGACY];
    for (const colecao of collections) {
      const snap = await this.db.collection(colecao).limit(200).get();
      for (const doc of snap.docs) {
        const emailDoc = doc.get('email');
        if (emailDoc && alvo === String(emailDoc).trim().toLowerCase()) return doc;
      }
    }
    return null;
  }

  async salvarSolicitacao(payload) {
    const ref = this.db.collection(this.COLLECTION_SOLICITACOES).doc();
    payload.id_solicitacao = ref.id;
    await ref.set(payload);
    return await ref.get();
  }

  async listarSolicitacoesPorAluno(uidAluno) {
    const snap = await this.db.collection(this.COLLECTION_SOLICITACOES).where('uid_aluno', '==', uidAluno).get();
    return snap.docs;
  }

  async listarSolicitacoes(status) {
    if (!status || !String(status).trim()) {
      const snap = await this.db.collection(this.COLLECTION_SOLICITACOES).get();
      return snap.docs;
    }
    const snap = await this.db.collection(this.COLLECTION_SOLICITACOES).where('status', '==', status).get();
    return snap.docs;
  }

  async buscarSolicitacaoPorId(idSolicitacao) {
    const doc = await this.db.collection(this.COLLECTION_SOLICITACOES).doc(idSolicitacao).get();
    return doc.exists ? doc : null;
  }

  async atualizarSolicitacao(idSolicitacao, updates) {
    await this.db.collection(this.COLLECTION_SOLICITACOES).doc(idSolicitacao).update(updates);
  }

  async listarUsuariosPorRole(role) {
    const [snap1, snap2] = await Promise.all([
      this.db.collection(this.COLLECTION_USUARIOS).get(),
      this.db.collection(this.COLLECTION_USUARIOS_LEGACY).get()
    ]);

    const all = [...snap1.docs, ...snap2.docs];
    return all.filter((doc) => rolesEquivalentes(doc.get('role'), role));
  }

  async buscarUsuarioPorId(uid) {
    return await this.buscarUsuarioPorUid(uid);
  }

  async salvarUsuario(uid, payload) {
    await this.db.collection(this.COLLECTION_USUARIOS).doc(uid).set(payload);
  }

  async removerUsuario(uid) {
    await this.db.collection(this.COLLECTION_USUARIOS).doc(uid).delete();
  }

  async listarCursos() {
    const snap = await this.db.collection(this.COLLECTION_CURSOS).get();
    return snap.docs;
  }

  async salvarCurso(idCurso, payload) {
    await this.db.collection(this.COLLECTION_CURSOS).doc(idCurso).set(payload);
  }

  async buscarCurso(idCurso) {
    const doc = await this.db.collection(this.COLLECTION_CURSOS).doc(idCurso).get();
    return doc.exists ? doc : null;
  }

  async creditarHorasAprovadas(uidAluno, idCurso, categoria, horasAprovadas) {
    const usuarioDoc = await this.buscarUsuarioPorUid(uidAluno);
    if (!usuarioDoc) return;

    const usuario = usuarioDoc.data();
    const vinculoRaw = usuario.vinculo;

    const vinculo = this.primeiroVinculo(vinculoRaw);
    if (!vinculo) return;

    const chaveSaldo = String(categoria)
      .toLowerCase()
      .replace('ã', 'a')
      .replace('ç', 'c')
      .replace('á', 'a')
      .replace('é', 'e');

    const cursoVinculo = vinculo.id_curso;
    if (!cursoVinculo || String(cursoVinculo) !== String(idCurso)) return;

    const saldos = vinculo.saldos || {};
    const atual = Number(saldos[chaveSaldo] ?? 0);
    saldos[chaveSaldo] = atual + Number(horasAprovadas);
    vinculo.saldos = saldos;

    await this.db.collection(this.COLLECTION_USUARIOS).doc(uidAluno).update({ vinculo });
  }

  primeiroVinculo(vinculoRaw) {
    if (!vinculoRaw) return null;
    if (typeof vinculoRaw === 'object' && !Array.isArray(vinculoRaw)) {
      return { ...vinculoRaw };
    }
    if (Array.isArray(vinculoRaw) && vinculoRaw.length > 0 && typeof vinculoRaw[0] === 'object') {
      return { ...vinculoRaw[0] };
    }
    return null;
  }
}

module.exports = FirestoreService;

