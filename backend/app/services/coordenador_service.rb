# frozen_string_literal: true

class CoordenadorService
  def initialize(
    firestore_service: FirestoreService.new,
    email_notification_service: EmailNotificationService.new
  )
    @firestore = firestore_service
    @email = email_notification_service
  end

  def listar_pendentes
    docs = @firestore.listar_solicitacoes("PENDENTE")
    map_coordenador(docs)
  end

  def listar_todas
    docs = @firestore.listar_solicitacoes(nil)
    map_coordenador(docs)
  end

  def decidir(id, status, horas_aprovadas: nil, justificativa: nil)
    status = "REPROVADO" if status == "INDEFERIDO"
    validar_status(status)

    doc = @firestore.buscar_solicitacao_por_id(id)
    return nil unless doc

    data = doc[:data]
    horas_final = horas_aprovadas || FirestoreKeyNormalizer.fetch_numeric(data, "horas_informadas")

    updates = {
      "status" => FirestoreKeyNormalizer.normalize_status_for_db(status),
      "horas_aprovadas" => status == "APROVADO" ? horas_final : 0,
      "justificativa_coordenador" => justificativa.to_s.strip
    }

    @firestore.atualizar_solicitacao(id, updates)
    Rails.logger.info("Solicitacao #{id} atualizada para status #{status}")

    if status == "APROVADO"
      @firestore.creditar_horas_aprovadas(
        texto(FirestoreKeyNormalizer.fetch_field(data, "uid_aluno")),
        texto(FirestoreKeyNormalizer.fetch_field(data, "id_curso")),
        texto(FirestoreKeyNormalizer.fetch_field(data, "categoria")),
        horas_final
      )
    end

    uid_aluno = texto(FirestoreKeyNormalizer.fetch_field(data, "uid_aluno"))
    aluno = @firestore.buscar_usuario_por_uid(uid_aluno)
    email_aluno = aluno ? texto(FirestoreKeyNormalizer.fetch_field(aluno[:data], "email")) : ""

    @email.enviar_status_solicitacao(
      email_aluno,
      texto(FirestoreKeyNormalizer.fetch_field(data, "titulo_atividade")),
      status,
      horas_aprovadas: status == "APROVADO" ? horas_final : nil,
      justificativa: justificativa
    )

    doc_atualizado = @firestore.buscar_solicitacao_por_id(id)
    doc_atualizado ? para_coordenador(doc_atualizado, nomes_cache: cache_nomes_alunos([doc_atualizado])) : nil
  end

  def resumo
    todas = @firestore.listar_solicitacoes(nil)
    pendentes = todas.count { |a| FirestoreKeyNormalizer.status_matches?(a.dig(:data, "status"), "PENDENTE") }
    aprovadas = todas.count { |a| FirestoreKeyNormalizer.status_matches?(a.dig(:data, "status"), "APROVADO") }
    rejeitadas = todas.count { |a| FirestoreKeyNormalizer.status_matches?(a.dig(:data, "status"), "REPROVADO") }
    total_decididas = aprovadas + rejeitadas
    taxa = total_decididas.zero? ? 0 : (aprovadas * 100) / total_decididas

    {
      pendentes: pendentes,
      aprovadasNoMes: aprovadas,
      rejeitadasNoMes: rejeitadas,
      alunosAtivos: @firestore.listar_usuarios_por_role("ALUNO").size,
      taxaAprovacao: taxa
    }
  end

  def perfil(uid, email, usuario_doc: nil)
    usuario = usuario_doc || @firestore.buscar_usuario(uid, email)
    raise ArgumentError, "Coordenador nao encontrado." unless usuario

    data = usuario[:data]
    {
      uid: usuario[:id],
      nome: FirestoreKeyNormalizer.fetch_field(data, "nome"),
      email: FirestoreKeyNormalizer.fetch_field(data, "email"),
      cpf: "",
      telefone: "",
      ingresso: "",
      matricula: "",
      departamento: texto(FirestoreKeyNormalizer.fetch_field(data, "departamento"))
    }
  end

  private

  def map_coordenador(docs)
    cache = cache_nomes_alunos(docs)
    docs.map { |doc| para_coordenador(doc, nomes_cache: cache) }
  end

  def cache_nomes_alunos(docs)
    uids = docs.map { |doc| texto(FirestoreKeyNormalizer.fetch_field(doc[:data], "uid_aluno")) }.reject(&:blank?).uniq
    uids.each_with_object({}) do |uid, cache|
      aluno = @firestore.buscar_usuario_por_uid(uid)
      cache[uid] = if aluno
                     nome = texto(FirestoreKeyNormalizer.fetch_field(aluno[:data], "nome"))
                     nome.presence || "Aluno"
                   else
                     "Aluno"
                   end
    end
  end

  def validar_status(status)
    return if %w[APROVADO REPROVADO PENDENTE].include?(status)

    raise ArgumentError, "Status invalido. Use APROVADO, REPROVADO ou PENDENTE."
  end

  def para_coordenador(doc, nomes_cache: {})
    data = doc[:data]
    uid_aluno = texto(FirestoreKeyNormalizer.fetch_field(data, "uid_aluno"))

    {
      id: doc[:id],
      titulo: texto(FirestoreKeyNormalizer.fetch_field(data, "titulo_atividade")),
      aluno: nomes_cache[uid_aluno] || buscar_nome_aluno(uid_aluno),
      tipo: texto(FirestoreKeyNormalizer.fetch_field(data, "categoria")),
      data: formatar_data(FirestoreKeyNormalizer.fetch_field(data, "data_envio")),
      horas: FirestoreKeyNormalizer.fetch_numeric(data, "horas_informadas"),
      confiancaIa: 0,
      status: normalizar_status_exibicao(texto(FirestoreKeyNormalizer.fetch_field(data, "status"))),
      comprovanteUrl: texto(FirestoreKeyNormalizer.fetch_field(data, "url_certificado"))
    }
  end

  def buscar_nome_aluno(uid_aluno)
    return "Aluno" if uid_aluno.blank?

    aluno = @firestore.buscar_usuario_por_uid(uid_aluno)
    return "Aluno" unless aluno

    nome = texto(FirestoreKeyNormalizer.fetch_field(aluno[:data], "nome"))
    nome.presence || "Aluno"
  end

  def normalizar_status_exibicao(status)
    s = status.to_s.upcase
    return "PENDENTE" if FirestoreKeyNormalizer.status_matches?(s, "PENDENTE")
    return "APROVADO" if FirestoreKeyNormalizer.status_matches?(s, "APROVADO")
    return "REPROVADO" if FirestoreKeyNormalizer.status_matches?(s, "REPROVADO")

    s
  end

  def formatar_data(data_envio)
    return data_envio.to_time.to_s if data_envio.respond_to?(:to_time)
    return data_envio.to_s if data_envio

    ""
  end

  def texto(value)
    value.nil? ? "" : value.to_s
  end
end
