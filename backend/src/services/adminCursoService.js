const { IllegalArgumentError } = require('../middleware/errorHandler');

class AdminCursoService {
  constructor(firestoreService) {
    this.firestoreService = firestoreService;
  }

  async listar() {
    const docs = await this.firestoreService.listarCursos();
    return docs.map((d) => this.paraModel(d));
  }

  async buscarPorId(idCurso) {
    const doc = await this.firestoreService.buscarCurso(idCurso);
    return doc ? this.paraModel(doc) : null;
  }

  async criar(curso) {
    this.validar(curso);
    const idCurso = String(curso.idCurso).trim();
    await this.firestoreService.salvarCurso(idCurso, this.payload(curso));
    return await this.buscarPorId(idCurso);
  }

  async atualizar(idCurso, curso) {
    this.validar(curso);
    const doc = await this.firestoreService.buscarCurso(idCurso);
    if (!doc) return null;

    await this.firestoreService.salvarCurso(idCurso, this.payload({ ...curso, idCurso }));
    return await this.buscarPorId(idCurso);
  }

  payload(curso) {
    return {
      id_curso: String(curso.idCurso).trim(),
      nome_curso: String(curso.nomeCurso).trim(),
      eixo_tecnologico: curso.eixoTecnologico == null ? '' : String(curso.eixoTecnologico).trim()
    };
  }

  paraModel(doc) {
    return {
      idCurso: doc.id,
      nomeCurso: doc.get('nome_curso'),
      eixoTecnologico: doc.get('eixo_tecnologico')
    };
  }

  validar(curso) {
    if (!curso || this.isBlank(curso.idCurso) || this.isBlank(curso.nomeCurso)) {
      throw new IllegalArgumentError('idCurso e nomeCurso sao obrigatorios.');
    }
  }

  isBlank(v) {
    return v == null || String(v).trim().length === 0;
  }
}

module.exports = AdminCursoService;

