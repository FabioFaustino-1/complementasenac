const { IllegalArgumentError } = require('../middleware/errorHandler');

class CoordenadorService {
  constructor(firestoreService, emailNotificationService) {
    this.firestoreService = firestoreService;
    this.emailNotificationService = emailNotificationService;
  }

  async listarPendentes() {
    const docs = await this.firestoreService.listarSolicitacoes('PENDENTE');
    return Promise.all(docs.map((d) => this.paraCoordenador(d)));
  }

  async listarTodas() {
    const docs = await this.firestoreService.listarSolicitacoes(null);
    return Promise.all(docs.map((d) => this.paraCoordenador(d)));
  }

  async decidir(id, status, horasAprovadas, justificativa) {
    let st = status;
    if (st === 'INDEFERIDO') st = 'REPROVADO';
    this.validarStatus(st);

    const doc = await this.firestoreService.buscarSolicitacaoPorId(id);
    if (!doc) return null;

    const horasFinal = horasAprovadas != null ? horasAprovadas : this.asInt(doc.get('horas_informadas'));

    const updates = {
      status: st,
      horas_aprovadas: st === 'APROVADO' ? horasFinal : 0,
      justificativa_coordenador: justificativa == null ? '' : String(justificativa).trim()
    };

    await this.firestoreService.atualizarSolicitacao(id, updates);

    if (st === 'APROVADO') {
      await this.firestoreService.creditarHorasAprovadas(
        this.texto(doc.get('uid_aluno')),
        doc.get('id_curso'),
        this.texto(doc.get('categoria')),
        horasFinal
      );
    }

    const uidAluno = this.texto(doc.get('uid_aluno'));
    const userAluno = await this.firestoreService.buscarUsuarioPorUid(uidAluno);
    const emailAluno = userAluno ? this.texto(userAluno.get('email')) : '';

    await this.emailNotificationService.enviarStatusSolicitacao(
      emailAluno,
      this.texto(doc.get('titulo_atividade')),
      st,
      st === 'APROVADO' ? horasFinal : null,
      justificativa
    );

    const updated = await this.firestoreService.buscarSolicitacaoPorId(id);
    return updated ? this.paraCoordenador(updated) : null;
  }

  async resumo() {
    const todas = await this.firestoreService.listarSolicitacoes(null);
    const pendentes = todas.filter((a) => this.texto(a.get('status')) === 'PENDENTE').length;
    const aprovadasNoMes = todas.filter((a) => this.texto(a.get('status')) === 'APROVADO').length;
    const rejeitadasNoMes = todas.filter((a) => this.texto(a.get('status')) === 'REPROVADO').length;

    const totalDecididas = aprovadasNoMes + rejeitadasNoMes;
    const taxa = totalDecididas === 0 ? 0 : Math.trunc((aprovadasNoMes * 100) / totalDecididas);

    const alunosAtivos = (await this.firestoreService.listarUsuariosPorRole('ALUNO')).length;

    return {
      pendentes,
      aprovadasNoMes,
      rejeitadasNoMes,
      alunosAtivos,
      taxaAprovacao: taxa
    };
  }

  async perfil(uid, email) {
    const usuario =
      (await this.firestoreService.buscarUsuarioPorUid(uid)) ||
      (await this.firestoreService.buscarUsuarioPorEmail(email));

    if (!usuario) throw new IllegalArgumentError('Coordenador nao encontrado.');

    return {
      uid: usuario.id,
      nome: this.texto(usuario.get('nome')),
      email: this.texto(usuario.get('email')),
      cpf: '',
      telefone: '',
      ingresso: '',
      matricula: '',
      departamento: ''
    };
  }

  validarStatus(status) {
    if (!['APROVADO', 'REPROVADO', 'PENDENTE'].includes(status)) {
      throw new IllegalArgumentError('Status invalido. Use APROVADO, REPROVADO ou PENDENTE.');
    }
  }

  async paraCoordenador(a) {
    const uidAluno = this.texto(a.get('uid_aluno'));
    const aluno = uidAluno ? await this.buscarNomeAluno(uidAluno) : 'Aluno';
    const dataEvento = this.texto(a.get('data_evento'));
    const dataEnvio = this.texto(a.get('data_envio'));

    return {
      id: a.id,
      titulo: this.texto(a.get('titulo_atividade')),
      aluno,
      tipo: this.texto(a.get('categoria')),
      data: dataEvento || dataEnvio,
      horas: this.asInt(a.get('horas_informadas')),
      confiancaIa: 0,
      status: this.texto(a.get('status')),
      comprovanteUrl: this.texto(a.get('url_certificado'))
    };
  }

  async buscarNomeAluno(uidAluno) {
    const doc = await this.firestoreService.buscarUsuarioPorUid(uidAluno);
    const nome = doc ? this.texto(doc.get('nome')) : '';
    return nome && nome.trim().length ? nome : 'Aluno';
  }

  asInt(value) {
    if (typeof value === 'number') return Math.trunc(value);
    if (value == null) return 0;
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }

  texto(value) {
    return value == null ? '' : String(value);
  }

  async solicitarExclusao(alunoId, nomeAluno, uidCoordenador, emailCoordenador) {
    const payload = {
      alunoId,
      nomeAluno,
      uidCoordenador,
      emailCoordenador,
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
    };

    return this.firestoreService.criarSolicitacaoExclusao(payload);
  }
}

module.exports = CoordenadorService;



