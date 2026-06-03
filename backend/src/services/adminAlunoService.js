const { IllegalArgumentError } = require('../middleware/errorHandler');
const { rolesEquivalentes } = require('../utils/roleUtils');

class AdminAlunoService {
  constructor(firestoreService, firebaseUserProvisioningService) {
    this.firestoreService = firestoreService;
    this.firebaseUserProvisioningService = firebaseUserProvisioningService;
  }

  async listar() {
    const docs = await this.firestoreService.listarUsuariosPorRole('ALUNO');
    return Promise.all(docs.map((d) => this.paraAlunoAdmin(d)));
  }

  async buscarPorId(id) {
    const doc = await this.firestoreService.buscarUsuarioPorId(id);
    if (!doc) return null;
    return this.paraAlunoAdmin(doc);
  }

  async criar(nome, email, matricula, curso) {
    this.validarDados(nome, email, matricula, curso);
    const uid = await this.firebaseUserProvisioningService.upsertUser(null, email, nome, matricula);
    await this.firestoreService.salvarUsuario(uid, await this.payloadAluno(uid, nome, email, matricula, curso, null));
    return await this.buscarPorId(uid);
  }

  async atualizar(id, nome, email, matricula, curso) {
    this.validarDados(nome, email, matricula, curso);
    const alunoExistente = await this.firestoreService.buscarUsuarioPorId(id);
    if (!alunoExistente) return null;
    if (!rolesEquivalentes(alunoExistente.get('role'), 'ALUNO')) return null;

    await this.firebaseUserProvisioningService.upsertUser(id, email, nome, matricula);
    await this.firestoreService.salvarUsuario(id, await this.payloadAluno(id, nome, email, matricula, curso, alunoExistente));
    return await this.buscarPorId(id);
  }

  async remover(id) {
    const atual = await this.buscarPorId(id);
    if (!atual) return false;
    await this.firebaseUserProvisioningService.deleteByUid(id);
    await this.firestoreService.removerUsuario(id);
    return true;
  }

  validarDados(nome, email, matricula, curso) {
    if (this.isBlank(nome) || this.isBlank(email) || this.isBlank(matricula) || this.isBlank(this.cursoId(curso))) {
      throw new IllegalArgumentError('Todos os campos sao obrigatorios.');
    }
    if (String(matricula).trim().length < 6) {
      throw new IllegalArgumentError('A matricula precisa ter ao menos 6 caracteres.');
    }
  }

  async payloadAluno(uid, nome, email, matricula, curso, atual) {
    const payload = {
      uid,
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      role: 'ALUNO'
    };

    const vinculoAtual = atual ? this.mapVinculo(atual.get('vinculo')) : null;

    const vinculo = {
      id_curso: this.cursoId(curso),
      id_turma: vinculoAtual ? this.texto(vinculoAtual.id_turma) : '',
      matricula: String(matricula).trim(),
      ch_total_exigida: 200,
      status_no_curso: 'Ativo',
      saldos: { ensino: 0, pesquisa: 0, extensao: 0 }
    };

    payload.vinculo = vinculo;
    return payload;
  }

  mapVinculo(rawVinculo) {
    if (!rawVinculo) return null;
    if (typeof rawVinculo === 'object' && !Array.isArray(rawVinculo)) return { ...rawVinculo };
    if (Array.isArray(rawVinculo) && rawVinculo.length > 0 && typeof rawVinculo[0] === 'object') return { ...rawVinculo[0] };
    return null;
  }

  async paraAlunoAdmin(doc) {
    const aluno = {
      id: doc.id,
      nome: this.texto(doc.get('nome')),
      email: this.texto(doc.get('email'))
    };

    const vinculo = this.mapVinculo(doc.get('vinculo'));
    if (vinculo) {
      aluno.matricula = this.texto(vinculo.matricula);
      aluno.curso = await this.cursoDoVinculo(vinculo);
      aluno.turma = this.texto(vinculo.id_turma);
    }
    return aluno;
  }

  async cursoDoVinculo(vinculo) {
    const cursoRaw = vinculo.id_curso || vinculo.curso;
    const nomeNoVinculo = this.cursoNome(cursoRaw);
    if (!this.isBlank(nomeNoVinculo)) return nomeNoVinculo;

    const idCurso = this.cursoId(cursoRaw);
    const cursoDoc = await this.firestoreService.buscarCurso(idCurso);
    const nomeCurso = cursoDoc ? this.texto(cursoDoc.get('nome_curso')) : '';
    return this.isBlank(nomeCurso) ? idCurso : nomeCurso;
  }

  cursoId(value) {
    if (value == null) return '';
    if (typeof value === 'object') {
      if (Array.isArray(value)) return value.length ? this.cursoId(value[0]) : '';
      return this.texto(value.id_curso || value.idCurso || value.id || value.codigo || value.codigoCurso).trim();
    }
    return this.texto(value).trim();
  }

  cursoNome(value) {
    if (value == null || typeof value !== 'object') return '';
    if (Array.isArray(value)) return value.length ? this.cursoNome(value[0]) : '';
    return this.texto(value.nome_curso || value.nomeCurso || value.nome || value.descricao);
  }

  isBlank(v) {
    return v == null || String(v).trim().length === 0;
  }

  texto(v) {
    return v == null ? '' : String(v);
  }
}

module.exports = AdminAlunoService;

