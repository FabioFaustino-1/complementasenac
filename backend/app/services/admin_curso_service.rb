# frozen_string_literal: true

class AdminCursoService
  def initialize(firestore_service: FirestoreService.new)
    @firestore = firestore_service
  end

  def listar
    @firestore.listar_cursos.map { |doc| para_model(doc) }
  end

  def buscar_por_id(id_curso)
    doc = @firestore.buscar_curso(id_curso)
    doc ? para_model(doc) : nil
  end

  def criar(curso)
    validar(curso)
    id_curso = FirestoreKeyNormalizer.normalize(curso[:idCurso]).presence || curso[:idCurso].to_s.strip
    @firestore.salvar_curso(id_curso, payload(curso, id_curso))
    buscar_por_id(id_curso) || raise(ArgumentError, "Falha ao criar curso.")
  end

  def atualizar(id_curso, curso)
    validar(curso)
    return nil unless buscar_por_id(id_curso)

    @firestore.salvar_curso(id_curso, payload(curso, id_curso))
    buscar_por_id(id_curso)
  end

  private

  def payload(curso, id_curso)
    {
      "id_curso" => id_curso,
      "nome_curso" => curso[:nomeCurso].to_s.strip,
      "eixo_tecnologico" => curso[:eixoTecnologico].to_s.strip
    }
  end

  def para_model(doc)
    data = doc[:data]
    {
      idCurso: texto(FirestoreKeyNormalizer.fetch_field(data, "id_curso")).presence || doc[:id],
      nomeCurso: texto(FirestoreKeyNormalizer.fetch_field(data, "nome_curso", "nome")),
      eixoTecnologico: texto(FirestoreKeyNormalizer.fetch_field(data, "eixo_tecnologico", "eixo"))
    }
  end

  def validar(curso)
    raise ArgumentError, "idCurso e nomeCurso sao obrigatorios." if curso.blank?
    raise ArgumentError, "idCurso e nomeCurso sao obrigatorios." if curso[:idCurso].blank? || curso[:nomeCurso].blank?
  end

  def texto(value)
    value.nil? ? "" : value.to_s
  end
end
