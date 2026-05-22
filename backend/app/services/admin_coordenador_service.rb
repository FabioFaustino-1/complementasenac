# frozen_string_literal: true

class AdminCoordenadorService
  def initialize(
    firestore_service: FirestoreService.new,
    firebase_auth_client: FirebaseAuthClient.new
  )
    @firestore = firestore_service
    @firebase_auth = firebase_auth_client
  end

  def listar
    @firestore.listar_usuarios_por_role("COORDENADOR").map { |doc| para_model(doc) }
  end

  def buscar_por_id(id)
    doc = @firestore.buscar_usuario_por_id(id)
    return nil unless doc
    return nil unless FirestoreKeyNormalizer.role_matches?(role_do_usuario(doc), "coordenador")

    para_model(doc)
  end

  def criar(coordenador)
    validar(coordenador)
    uid = @firebase_auth.upsert_user(
      preferred_uid: nil,
      email: coordenador[:email],
      display_name: coordenador[:nome],
      password: senha_padrao_coordenador(coordenador[:email])
    )
    @firestore.salvar_usuario(uid, payload(uid, coordenador))
    buscar_por_id(uid) || raise(ArgumentError, "Falha ao criar coordenador.")
  end

  def atualizar(id, coordenador)
    validar(coordenador)
    return nil unless buscar_por_id(id)

    @firebase_auth.upsert_user(
      preferred_uid: id,
      email: coordenador[:email],
      display_name: coordenador[:nome],
      password: senha_padrao_coordenador(coordenador[:email])
    )
    @firestore.salvar_usuario(id, payload(id, coordenador))
    buscar_por_id(id)
  end

  def remover(id)
    return false unless buscar_por_id(id)

    @firebase_auth.delete_by_uid(id)
    @firestore.remover_usuario(id)
    true
  end

  private

  def validar(coordenador)
    raise ArgumentError, "Nome e e-mail do coordenador sao obrigatorios." if coordenador.blank?
    raise ArgumentError, "Nome e e-mail do coordenador sao obrigatorios." if coordenador[:nome].blank? || coordenador[:email].blank?
  end

  def payload(uid, coordenador)
    {
      "uid" => uid,
      "nome" => coordenador[:nome].to_s.strip,
      "email" => coordenador[:email].to_s.strip.downcase,
      "role" => "coordenador",
      "departamento" => coordenador[:departamento].to_s.strip,
      "status" => coordenador[:status].presence || "ativo",
      "cursos" => coordenador[:cursos] || [],
      "vinculo" => {}
    }
  end

  def para_model(doc)
    data = doc[:data]
    cursos = FirestoreKeyNormalizer.fetch_field(data, "cursos") || []

    {
      id: doc[:id],
      nome: FirestoreKeyNormalizer.fetch_field(data, "nome"),
      email: FirestoreKeyNormalizer.fetch_field(data, "email"),
      departamento: FirestoreKeyNormalizer.fetch_field(data, "departamento"),
      status: FirestoreKeyNormalizer.fetch_field(data, "status"),
      cursos: cursos.is_a?(Array) ? cursos : []
    }
  end

  def senha_padrao_coordenador(email)
    normalized = email.to_s.strip.downcase
    at_index = normalized.index("@")
    base = at_index.to_i.positive? ? normalized[0...at_index] : normalized
    raise ArgumentError, "E-mail invalido para gerar senha padrao do coordenador." if base.blank?

    "#{base}2026"
  end

  def role_do_usuario(doc)
    FirestoreKeyNormalizer.fetch_field(doc[:data], "role", "perfil", "tipo")
  end
end
