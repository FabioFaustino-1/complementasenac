# frozen_string_literal: true

require "google/cloud/firestore"
require "timeout"

class FirestoreService
  COLLECTION_USUARIOS_PADRAO = "usuarios"
  COLLECTION_SOLICITACOES_PADRAO = "solicitacoes"
  COLLECTION_CURSOS_PADRAO = "cursos"

  COLLECTIONS_USUARIOS_FALLBACK = %w[Usuarios users Users].freeze
  COLLECTIONS_SOLICITACOES_FALLBACK = %w[Solicitacoes atividades Atividades].freeze
  COLLECTIONS_CURSOS_FALLBACK = %w[Cursos].freeze

  FIRESTORE_TIMEOUT = 8
  @db = nil
  @db_mutex = Mutex.new

  class << self
    attr_accessor :db
  end

  def db
    return self.class.db if self.class.db

    self.class.instance_variable_get(:@db_mutex).synchronize do
      return self.class.db if self.class.db

      cfg = Rails.application.config.firebase
      options = {
        project_id: cfg[:project_id],
        timeout: FIRESTORE_TIMEOUT,
        retries: 2
      }
      options[:credentials] = cfg[:credentials_path] if cfg[:credentials_path].present?

      self.class.db = Google::Cloud::Firestore.new(**options)
    end
  end

  def buscar_usuario(uid, email)
    with_timeout { buscar_usuario_por_email(email) } ||
      with_timeout { buscar_usuario_por_uid(uid) }
  end

  def buscar_usuario_por_uid(uid)
    return nil if uid.blank?

    each_usuarios_collection do |collection|
      doc = with_timeout { buscar_documento_por_id(collection, uid) }
      return doc if doc

      norm = FirestoreKeyNormalizer.normalize(uid)
      if norm.present? && norm != uid.to_s
        doc = with_timeout { buscar_documento_por_id(collection, norm) }
        return doc if doc
      end

      doc = with_timeout { buscar_usuario_por_campo_uid(collection, uid) }
      return doc if doc
    end

    nil
  end

  def buscar_usuario_por_email(email)
    return nil if email.blank?

    alvo = email.strip.downcase

    each_usuarios_collection do |collection|
      doc = with_timeout { query_usuario_por_email(collection, alvo) }
      return doc if doc
    end

    nil
  end

  def salvar_solicitacao(payload)
    with_timeout do
      col = db.col(COLLECTION_SOLICITACOES_PADRAO)
      ref = col.doc
      data = payload.deep_dup
      data["id_solicitacao"] = ref.document_id
      data["status"] = FirestoreKeyNormalizer.normalize_status_for_db(data["status"] || "pendente")
      ref.set(data)
      buscar_solicitacao_por_id(ref.document_id)
    end
  end

  def listar_solicitacoes_por_aluno(uid_aluno, usuario_doc: nil)
    uids = solicitacao_uid_candidates(uid_aluno, usuario_doc)
    docs = []

    each_solicitacoes_collection do |collection|
      uids.each do |uid|
        with_timeout do
          db.col(collection).where("uid_aluno", "=", uid).limit(100).get.each do |doc|
            docs << doc_to_hash(doc, collection: collection)
          end
        end
      end
    end

    docs.uniq { |d| d[:id] }
  end

  def listar_solicitacoes(status = nil)
    docs = []

    if status.blank?
      each_solicitacoes_collection do |collection|
        with_timeout do
          db.col(collection).limit(500).get.each { |doc| docs << doc_to_hash(doc, collection: collection) }
        end
      end
      return docs.uniq { |d| d[:id] }
    end

    status_db = FirestoreKeyNormalizer.normalize_status_for_db(status)
    each_solicitacoes_collection do |collection|
      with_timeout do
        db.col(collection).where("status", "=", status_db).limit(200).get.each do |doc|
          docs << doc_to_hash(doc, collection: collection)
        end
      end
    end

    docs.uniq { |d| d[:id] }
  end

  def buscar_solicitacao_por_id(id_solicitacao)
    each_solicitacoes_collection do |collection|
      FirestoreKeyNormalizer.document_id_candidates(id_solicitacao).each do |doc_id|
        doc = with_timeout { buscar_documento_por_id(collection, doc_id) }
        return doc if doc
      end
    end
    nil
  end

  def atualizar_solicitacao(id_solicitacao, updates)
    doc = buscar_solicitacao_por_id(id_solicitacao)
    raise ArgumentError, "Solicitacao nao encontrada." unless doc

    data = updates.deep_dup
    data["status"] = FirestoreKeyNormalizer.normalize_status_for_db(data["status"]) if data["status"]

    with_timeout do
      ref = db.doc("#{doc[:collection]}/#{doc[:id]}")
      ref.update(data)
    end
  end

  def listar_usuarios_por_role(role)
    role_alvo = FirestoreKeyNormalizer.normalize_role_for_db(role)
    usuarios = []

    each_usuarios_collection do |collection|
      with_timeout do
        db.col(collection).limit(500).get.each do |doc|
          hash = doc_to_hash(doc, collection: collection)
          usuarios << hash if FirestoreKeyNormalizer.role_matches?(role_do_usuario(hash), role_alvo)
        end
      end
    end

    usuarios.uniq { |u| u[:id] }
  end

  def buscar_usuario_por_id(uid)
    buscar_usuario_por_uid(uid)
  end

  def salvar_usuario(uid, payload)
    with_timeout do
      existing = buscar_usuario_por_uid(uid)
      collection = existing ? existing[:collection] : COLLECTION_USUARIOS_PADRAO
      doc_id = existing ? existing[:id] : FirestoreKeyNormalizer.normalize(uid).presence || uid

      ref = db.doc("#{collection}/#{doc_id}")
      ref.set(payload, merge: true)
    end
  end

  def remover_usuario(uid)
    doc = buscar_usuario_por_uid(uid)
    return unless doc

    with_timeout { db.doc("#{doc[:collection]}/#{doc[:id]}").delete }
  end

  def listar_cursos
    docs = []
    each_cursos_collection do |collection|
      with_timeout do
        db.col(collection).get.each { |doc| docs << doc_to_hash(doc, collection: collection) }
      end
    end
    docs.uniq { |d| d[:id] }
  end

  def salvar_curso(id_curso, payload)
    with_timeout do
      existing = buscar_curso(id_curso)
      collection = existing ? existing[:collection] : COLLECTION_CURSOS_PADRAO
      doc_id = existing ? existing[:id] : FirestoreKeyNormalizer.normalize(id_curso).presence || id_curso

      ref = db.doc("#{collection}/#{doc_id}")
      ref.set(payload, merge: true)
    end
  end

  def buscar_curso(id_curso)
    each_cursos_collection do |collection|
      FirestoreKeyNormalizer.document_id_candidates(id_curso).each do |doc_id|
        doc = with_timeout { buscar_documento_por_id(collection, doc_id) }
        return doc if doc
      end
    end
    nil
  end

  def creditar_horas_aprovadas(uid_aluno, id_curso, categoria, horas_aprovadas)
    usuario = buscar_usuario_por_uid(uid_aluno)
    return unless usuario

    vinculo = primeiro_vinculo(usuario[:data])
    return unless vinculo

    chave_saldo = FirestoreKeyNormalizer.saldo_key_for_categoria(categoria)
    curso_vinculo = FirestoreKeyNormalizer.fetch_field(vinculo, "id_curso", "curso")
    return unless curso_vinculo && ids_match?(curso_vinculo, id_curso)

    saldos = FirestoreKeyNormalizer.fetch_field(vinculo, "saldos") || {}
    atual = FirestoreKeyNormalizer.fetch_numeric(saldos, chave_saldo)
    saldos[chave_saldo] = atual + horas_aprovadas
    vinculo["saldos"] = saldos

    with_timeout do
      ref = db.doc("#{usuario[:collection]}/#{usuario[:id]}")
      ref.update("vinculo" => vinculo)
    end
  end

  private

  def with_timeout(seconds = FIRESTORE_TIMEOUT, &block)
    Timeout.timeout(seconds, &block)
  end

  def each_usuarios_collection
    yield COLLECTION_USUARIOS_PADRAO
    COLLECTIONS_USUARIOS_FALLBACK.each { |collection| yield collection }
  end

  def each_solicitacoes_collection
    yield COLLECTION_SOLICITACOES_PADRAO
    COLLECTIONS_SOLICITACOES_FALLBACK.each { |collection| yield collection }
  end

  def each_cursos_collection
    yield COLLECTION_CURSOS_PADRAO
    COLLECTIONS_CURSOS_FALLBACK.each { |collection| yield collection }
  end

  def query_usuario_por_email(collection, email)
    query = db.col(collection).where("email", "=", email).limit(1).get
    doc = query.first
    return doc_to_hash(doc, collection: collection) if doc

    nil
  end

  def buscar_usuario_por_campo_uid(collection, uid)
    query = db.col(collection).where("uid", "=", uid).limit(1).get
    doc = query.first
    return doc_to_hash(doc, collection: collection) if doc

    nil
  end

  def buscar_documento_por_id(collection, id)
    doc = db.doc("#{collection}/#{id}").get
    return doc_to_hash(doc, collection: collection) if doc.exists?

    nil
  end

  def solicitacao_uid_candidates(uid_aluno, usuario_doc)
    ids = [uid_aluno.to_s.strip]
    if usuario_doc
      ids << usuario_doc[:id].to_s
      doc_uid = FirestoreKeyNormalizer.fetch_field(usuario_doc[:data], "uid")
      ids << doc_uid.to_s if doc_uid.present?
    end
    ids.compact.reject(&:blank?).uniq
  end

  def doc_to_hash(doc, collection: nil)
    data = doc.data.transform_keys(&:to_s)
    {
      id: doc.document_id,
      collection: collection || doc.ref.parent.id,
      data: data
    }
  end

  def role_do_usuario(doc)
    data = doc[:data] || doc
    FirestoreKeyNormalizer.fetch_field(data, "role", "perfil", "tipo")
  end

  def primeiro_vinculo(data)
    raw = FirestoreKeyNormalizer.fetch_field(data, "vinculo")
    return deep_stringify(raw) if raw.is_a?(Hash)
    return deep_stringify(raw.first) if raw.is_a?(Array) && raw.first.is_a?(Hash)

    nil
  end

  def deep_stringify(value)
    case value
    when Hash
      value.each_with_object({}) { |(k, v), h| h[k.to_s] = deep_stringify(v) }
    when Array
      value.map { |v| deep_stringify(v) }
    else
      value
    end
  end

  def ids_match?(left, right)
    FirestoreKeyNormalizer.normalize(left) == FirestoreKeyNormalizer.normalize(right)
  end
end
