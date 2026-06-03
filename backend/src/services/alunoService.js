const { IllegalArgumentError } = require('../middleware/errorHandler');

class AlunoService {
  constructor(firestoreService, fileUploadService) {
    this.firestoreService = firestoreService;
    this.fileUploadService = fileUploadService;
    // PerfilService fica em serviços; aqui só precisa resolver perfil quando chamado por /api/usuario
    // Para manter sem acoplamento circular, a rota /api/usuario usa perfilResolver.
    this.perfilResolverFn = null;
  }

  // setado pelo getServices
  setPerfilResolver(fn) {
    this.perfilResolverFn = fn;
  }

  perfilResolver(uid, email) {
    return this.perfilResolverFn(uid, email);
  }

  async buscarPerfil(uid, email) {
    const usuario = await this.buscarUsuario(uid, email);
    const primeiroVinculo = this.primeiroVinculo(usuario);

    return {
      uid: usuario.get('uid'),
      nome: usuario.get('nome'),
      email: usuario.get('email'),
      telefone: '',
      ingresso: '',
      curso: await this.cursoDoVinculo(primeiroVinculo),
      departamento: '',
      matricula: this.texto(primeiroVinculo.matricula)
    };

  }


  async buscarResumo(uid, email) {
    const usuario = await this.buscarUsuario(uid, email);
    const vinculo = this.primeiroVinculo(usuario);
    const atividades = await this.listarHistorico(uid, email);

    const aprovadas = atividades.filter((a) => a.status === 'APROVADO').length;
    const pendentes = atividades.filter((a) => a.status === 'PENDENTE').length;
    const indeferidas = atividades.filter((a) => a.status === 'REPROVADO').length;

    const saldos = this.castMap(vinculo.saldos);
    const horasConcluidas =
      this.asInt(saldos.ensino) + this.asInt(saldos.pesquisa) + this.asInt(saldos.extensao);

    let horasNecessarias = this.asInt(vinculo.ch_total_exigida);
    if (horasNecessarias <= 0) horasNecessarias = 200;

    const percentualConcluido = Math.min(100, Math.floor((horasConcluidas * 100) / horasNecessarias));

    return {
      curso: await this.cursoDoVinculo(vinculo),
      horasConcluidas,
      horasNecessarias,
      percentualConcluido,
      aprovadas,
      pendentes,
      indeferidas,
      totalAtividades: atividades.length
    };
  }

  async listarHistorico(uid, email) {
    const usuario = await this.buscarUsuario(uid, email);
    const uidAluno = usuario.id;

    const docs = await this.firestoreService.listarSolicitacoesPorAluno(uidAluno);
    const atividades = docs.map((doc) => this.paraAtividade(doc));

    const all = await Promise.all(atividades);
    all.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    return all;
  }

  async listarRecentes(limite, uid, email) {
    const all = await this.listarHistorico(uid, email);
    return all.slice(0, limite);
  }

  async submeterAtividade(payload, uid, email) {
    this.validarSubmissao(payload);
    const usuario = await this.buscarUsuario(uid, email);
    const vinculo = this.primeiroVinculo(usuario);

    const idCursoPayload = this.cursoId(payload.idCurso);
    const idCurso = this.isBlank(idCursoPayload) ? this.cursoId(vinculo.id_curso || vinculo.curso) : idCursoPayload;
    const categoria = this.resolverCategoria(payload.categoria, payload.tipo);

    const comprovanteUrl = await this.fileUploadService.uploadDataUrl(payload.comprovanteUrl, usuario.id);

    const doc = {
      uid_aluno: usuario.id,
      id_curso: idCurso,
      titulo_atividade: String(payload.titulo).trim(),
      categoria,
      horas_informadas: payload.horas,
      horas_aprovadas: 0,
      status: 'PENDENTE',
      url_certificado: comprovanteUrl,
      data_evento: payload.data ? String(payload.data).trim() : '',
      data_envio: new Date().toISOString(),
      justificativa_coordenador: ''
    };

    const salvo = await this.firestoreService.salvarSolicitacao(doc);
    return this.paraAtividade(salvo);
  }

  validarSubmissao(payload) {
    if (!payload) throw new IllegalArgumentError('Payload de submissao nao enviado.');
    if (this.isBlank(payload.titulo) || this.isBlank(payload.tipo)) {
      throw new IllegalArgumentError('Titulo e tipo sao obrigatorios.');
    }
    if (payload.horas <= 0) {
      throw new IllegalArgumentError('Horas deve ser maior que zero.');
    }
  }

  async buscarUsuario(uid, email) {
    const porUid = await this.firestoreService.buscarUsuarioPorUid(uid);
    if (porUid) return porUid;

    const byEmail = await this.firestoreService.buscarUsuarioPorEmail(email);
    if (!byEmail) throw new IllegalArgumentError('Usuario nao encontrado no banco.');
    return byEmail;
  }

  paraAtividade(doc) {
    const categoriaRaw = doc.get('categoria');
    const statusRaw = doc.get('status');

    return {
      id: doc.get('id_solicitacao') != null ? doc.get('id_solicitacao') : doc.id,
      titulo: this.texto(doc.get('titulo_atividade')),
      tipo: this.texto(categoriaRaw),
      categoria: this.texto(categoriaRaw),
      horas: this.asInt(doc.get('horas_informadas')),
      horasAprovadas: this.asInt(doc.get('horas_aprovadas')),
      status: this.normalizarStatus(this.texto(statusRaw)),
      comprovanteUrl: this.texto(doc.get('url_certificado')),
      data: this.formatarData(doc.get('data_evento') || doc.get('data_envio')),
      justificativaCoordenador: this.texto(doc.get('justificativa_coordenador'))
    };
  }

  primeiroVinculo(usuarioDoc) {
    const vinculoRaw = usuarioDoc.get('vinculo');

    if (vinculoRaw && typeof vinculoRaw === 'object' && !Array.isArray(vinculoRaw)) {
      return { ...vinculoRaw };
    }
    if (Array.isArray(vinculoRaw) && vinculoRaw.length > 0 && typeof vinculoRaw[0] === 'object') {
      return { ...vinculoRaw[0] };
    }

    throw new IllegalArgumentError('Usuario sem vinculo no curso.');
  }

  castMap(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) return { ...value };
    return {};
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

  resolverCategoria(categoria, tipo) {
    if (!this.isBlank(categoria)) return this.capitalizarCategoria(categoria);
    const t = tipo == null ? '' : String(tipo).toLowerCase();
    if (t.includes('pesquisa')) return 'Pesquisa';
    if (t.includes('monitoria') || t.includes('curso')) return 'Ensino';
    return 'Extensao';
  }

  capitalizarCategoria(categoria) {
    const c = String(categoria).trim().toLowerCase();
    if (c.startsWith('ens')) return 'Ensino';
    if (c.startsWith('pes')) return 'Pesquisa';
    return 'Extensao';
  }

  normalizarStatus(status) {
    if ('REPROVADO' === String(status)) return 'INDEFERIDO';
    return status == null || status === '' ? 'PENDENTE' : String(status).toUpperCase();
  }

  formatarData(dataEnvio) {
    return dataEnvio ? String(dataEnvio) : '';
  }

  async cursoDoVinculo(vinculo) {
    const cursoRaw = vinculo.id_curso || vinculo.curso;
    const nomeNoVinculo = this.cursoNome(cursoRaw);
    if (!this.isBlank(nomeNoVinculo)) return nomeNoVinculo;

    const idCurso = this.cursoId(cursoRaw);
    const c = await this.firestoreService.buscarCurso(idCurso);
    if (c) {
      const nome = this.texto(c.get('nome_curso'));
      if (!this.isBlank(nome)) return nome;
    }
    return idCurso;
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

  isBlank(valor) {
    return valor == null || String(valor).trim().length === 0;
  }
}

module.exports = AlunoService;

