# frozen_string_literal: true

class AlunoService
  def initialize(firestore_service: FirestoreService.new, file_upload_service: FileUploadService.new)
    @firestore = firestore_service
    @file_upload = file_upload_service
  end

  def buscar_perfil(uid, email, usuario_doc: nil)
    usuario = resolve_usuario(uid, email, usuario_doc)
    vinculo = primeiro_vinculo(usuario)

    {
      uid: FirestoreKeyNormalizer.fetch_field(usuario[:data], "uid").presence || usuario[:id],
      nome: FirestoreKeyNormalizer.fetch_field(usuario[:data], "nome"),
      email: FirestoreKeyNormalizer.fetch_field(usuario[:data], "email"),
      telefone: "",
      ingresso: "",
      curso: curso_do_vinculo(vinculo),
      departamento: "",
      matricula: texto(vinculo["matricula"])
    }
  end

  def buscar_resumo(uid, email, usuario_doc: nil)
    usuario = resolve_usuario(uid, email, usuario_doc)
    vinculo = primeiro_vinculo(usuario)
    atividades = listar_historico(uid, email, usuario_doc: usuario)

    aprovadas = atividades.count { |a| a[:status] == "APROVADO" }
    pendentes = atividades.count { |a| a[:status] == "PENDENTE" }
    indeferidas = atividades.count { |a| %w[REPROVADO INDEFERIDO].include?(a[:status]) }

    saldos = FirestoreKeyNormalizer.fetch_field(vinculo, "saldos") || {}
    horas_concluidas = FirestoreKeyNormalizer.fetch_numeric(saldos, "ensino") +
                       FirestoreKeyNormalizer.fetch_numeric(saldos, "pesquisa") +
                       FirestoreKeyNormalizer.fetch_numeric(saldos, "extensao")
    horas_necessarias = FirestoreKeyNormalizer.fetch_numeric(vinculo, "ch_total_exigida")
    horas_necessarias = 200 if horas_necessarias <= 0

    percentual = horas_necessarias.positive? ? [100, (horas_concluidas * 100) / horas_necessarias].min : 0

    {
      curso: curso_do_vinculo(vinculo),
      horasConcluidas: horas_concluidas,
      horasNecessarias: horas_necessarias,
      percentualConcluido: percentual,
      aprovadas: aprovadas,
      pendentes: pendentes,
      indeferidas: indeferidas,
      totalAtividades: atividades.size
    }
  end

  def listar_historico(uid, email, usuario_doc: nil)
    usuario = resolve_usuario(uid, email, usuario_doc)
    docs = @firestore.listar_solicitacoes_por_aluno(uid, usuario_doc: usuario)
    docs.map { |doc| para_atividade(doc) }.sort_by { |a| a[:data].to_s }.reverse
  end

  def listar_recentes(limite, uid, email, usuario_doc: nil)
    listar_historico(uid, email, usuario_doc: usuario_doc).first(limite)
  end

  def submeter_atividade(payload, uid, email)
    validar_submissao(payload)
    usuario = resolve_usuario(uid, email)
    vinculo = primeiro_vinculo(usuario)
    id_curso = payload["idCurso"].to_s.strip.presence ||
               texto(FirestoreKeyNormalizer.fetch_field(vinculo, "id_curso"))
    categoria = resolver_categoria(payload["categoria"], payload["tipo"])
    comprovante_url = @file_upload.upload_data_url(payload["comprovanteUrl"], usuario[:id])

    doc = {
      "uid_aluno" => FirestoreKeyNormalizer.fetch_field(usuario[:data], "uid").presence || usuario[:id],
      "id_curso" => FirestoreKeyNormalizer.normalize(id_curso).presence || id_curso,
      "titulo_atividade" => payload["titulo"].to_s.strip,
      "categoria" => categoria,
      "horas_informadas" => payload["horas"].to_i,
      "horas_aprovadas" => 0,
      "status" => "pendente",
      "url_certificado" => comprovante_url,
      "data_envio" => Time.current,
      "justificativa_coordenador" => ""
    }

    salvo = @firestore.salvar_solicitacao(doc)
    para_atividade(salvo)
  end

  private

  def resolve_usuario(uid, email, usuario_doc = nil)
    return usuario_doc if usuario_doc

    doc = @firestore.buscar_usuario(uid, email)
    raise ArgumentError, "Usuario nao encontrado no banco." unless doc

    doc
  end

  def validar_submissao(payload)
    raise ArgumentError, "Payload de submissao nao enviado." if payload.blank?
    raise ArgumentError, "Titulo e tipo sao obrigatorios." if payload["titulo"].blank? || payload["tipo"].blank?
    raise ArgumentError, "Horas deve ser maior que zero." if payload["horas"].to_i <= 0
  end

  def para_atividade(doc)
    data = doc[:data]
    {
      id: FirestoreKeyNormalizer.fetch_field(data, "id_solicitacao") || doc[:id],
      titulo: texto(FirestoreKeyNormalizer.fetch_field(data, "titulo_atividade")),
      tipo: texto(FirestoreKeyNormalizer.fetch_field(data, "categoria")),
      categoria: texto(FirestoreKeyNormalizer.fetch_field(data, "categoria")),
      horas: FirestoreKeyNormalizer.fetch_numeric(data, "horas_informadas"),
      horasAprovadas: FirestoreKeyNormalizer.fetch_numeric(data, "horas_aprovadas"),
      status: normalizar_status(texto(FirestoreKeyNormalizer.fetch_field(data, "status"))),
      comprovanteUrl: texto(FirestoreKeyNormalizer.fetch_field(data, "url_certificado")),
      data: formatar_data(FirestoreKeyNormalizer.fetch_field(data, "data_envio")),
      justificativaCoordenador: texto(FirestoreKeyNormalizer.fetch_field(data, "justificativa_coordenador"))
    }
  end

  def primeiro_vinculo(usuario)
    data = usuario[:data]
    raw = FirestoreKeyNormalizer.fetch_field(data, "vinculo")

    if raw.is_a?(Hash)
      return stringify_hash(raw)
    end
    if raw.is_a?(Array) && raw.first.is_a?(Hash)
      return stringify_hash(raw.first)
    end

    vinculo = {
      "id_curso" => texto(FirestoreKeyNormalizer.fetch_field(data, "id_curso", "curso")),
      "matricula" => texto(FirestoreKeyNormalizer.fetch_field(data, "matricula")),
      "ch_total_exigida" => FirestoreKeyNormalizer.fetch_field(data, "ch_total_exigida")
    }

    if vinculo["id_curso"].present? || vinculo["matricula"].present?
      return vinculo
    end

    raise ArgumentError, "Usuario sem vinculo no curso."
  end

  def stringify_hash(hash)
    hash.each_with_object({}) { |(k, v), h| h[k.to_s] = v }
  end

  def resolver_categoria(categoria, tipo)
    return capitalizar_categoria(categoria) if categoria.present?

    t = tipo.to_s.downcase
    return "Pesquisa" if t.include?("pesquisa")
    return "Ensino" if t.include?("monitoria") || t.include?("curso")

    "Extensao"
  end

  def capitalizar_categoria(categoria)
    c = categoria.to_s.strip.downcase
    return "Ensino" if c.start_with?("ens")
    return "Pesquisa" if c.start_with?("pes")

    "Extensao"
  end

  def normalizar_status(status)
    return "INDEFERIDO" if status.to_s.upcase == "REPROVADO"

    status.presence&.upcase || "PENDENTE"
  end

  def formatar_data(data_envio)
    return data_envio.to_time.to_s if data_envio.respond_to?(:to_time)
    return data_envio.to_s if data_envio

    ""
  end

  def curso_do_vinculo(vinculo)
    id_curso = texto(FirestoreKeyNormalizer.fetch_field(vinculo, "id_curso", "curso"))
    return id_curso if id_curso.blank?

    curso = @firestore.buscar_curso(id_curso)
    if curso
      nome = texto(FirestoreKeyNormalizer.fetch_field(curso[:data], "nome_curso", "nome"))
      return nome if nome.present?
    end
    id_curso
  end

  def texto(value)
    value.nil? ? "" : value.to_s
  end
end
