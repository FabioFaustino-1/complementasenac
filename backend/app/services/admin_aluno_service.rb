# frozen_string_literal: true

class AdminAlunoService
  def initialize(
    firestore_service: FirestoreService.new,
    firebase_auth_client: FirebaseAuthClient.new
  )
    @firestore = firestore_service
    @firebase_auth = firebase_auth_client
  end

  def listar
    @firestore.listar_usuarios_por_role("ALUNO").map { |doc| para_aluno_admin(doc) }
  end

  def buscar_por_id(id)
    doc = @firestore.buscar_usuario_por_id(id)
    return nil unless doc
    return nil unless FirestoreKeyNormalizer.role_matches?(role_do_usuario(doc), "aluno")

    para_aluno_admin(doc)
  end

  def criar(nome:, email:, matricula:, curso:)
    validar_dados(nome, email, matricula, curso)
    uid = @firebase_auth.upsert_user(
      preferred_uid: nil,
      email: email,
      display_name: nome,
      password: matricula
    )
    @firestore.salvar_usuario(uid, payload_aluno(uid, nome, email, matricula, curso, nil))
    buscar_por_id(uid) || raise(ArgumentError, "Falha ao criar aluno.")
  end

  def atualizar(id, nome:, email:, matricula:, curso:)
    validar_dados(nome, email, matricula, curso)
    existente = @firestore.buscar_usuario_por_id(id)
    return nil unless existente
    return nil unless FirestoreKeyNormalizer.role_matches?(role_do_usuario(existente), "aluno")

    @firebase_auth.upsert_user(
      preferred_uid: id,
      email: email,
      display_name: nome,
      password: matricula
    )
    @firestore.salvar_usuario(id, payload_aluno(id, nome, email, matricula, curso, existente))
    buscar_por_id(id)
  end

  def remover(id)
    return false unless buscar_por_id(id)

    @firebase_auth.delete_by_uid(id)
    @firestore.remover_usuario(id)
    true
  end

  private

  def validar_dados(nome, email, matricula, curso)
    raise ArgumentError, "Todos os campos sao obrigatorios." if [nome, email, matricula, curso].any?(&:blank?)
    raise ArgumentError, "A matricula precisa ter ao menos 6 caracteres." if matricula.to_s.strip.length < 6
  end

  def para_aluno_admin(doc)
    data = doc[:data]
    vinculo = map_vinculo(FirestoreKeyNormalizer.fetch_field(data, "vinculo"))

    if vinculo
      {
        id: doc[:id],
        nome: FirestoreKeyNormalizer.fetch_field(data, "nome"),
        email: FirestoreKeyNormalizer.fetch_field(data, "email"),
        matricula: texto(vinculo["matricula"]),
        curso: texto(vinculo["id_curso"]),
        turma: texto(vinculo["id_turma"])
      }
    else
      {
        id: doc[:id],
        nome: FirestoreKeyNormalizer.fetch_field(data, "nome"),
        email: FirestoreKeyNormalizer.fetch_field(data, "email"),
        matricula: FirestoreKeyNormalizer.fetch_field(data, "matricula"),
        curso: texto(FirestoreKeyNormalizer.fetch_field(data, "id_curso", "curso")),
        turma: texto(FirestoreKeyNormalizer.fetch_field(data, "id_turma", "turma"))
      }
    end
  end

  def payload_aluno(uid, nome, email, matricula, curso, atual)
    vinculo_atual = atual ? map_vinculo(FirestoreKeyNormalizer.fetch_field(atual[:data], "vinculo")) : nil
    id_curso_norm = FirestoreKeyNormalizer.normalize(curso)

    vinculo = {
      "id_curso" => id_curso_norm.presence || curso.to_s.strip,
      "id_turma" => vinculo_atual ? texto(vinculo_atual["id_turma"]) : "",
      "matricula" => matricula.to_s.strip,
      "ch_total_exigida" => 200,
      "status_no_curso" => "ativo",
      "saldos" => {
        "ensino" => 0,
        "pesquisa" => 0,
        "extensao" => 0
      }
    }

    {
      "uid" => uid,
      "nome" => nome.to_s.strip,
      "email" => email.to_s.strip.downcase,
      "role" => "aluno",
      "vinculo" => vinculo
    }
  end

  def map_vinculo(raw_vinculo)
    return stringify_hash(raw_vinculo) if raw_vinculo.is_a?(Hash)
    return stringify_hash(raw_vinculo.first) if raw_vinculo.is_a?(Array) && raw_vinculo.first.is_a?(Hash)

    nil
  end

  def stringify_hash(hash)
    hash.each_with_object({}) { |(k, v), h| h[k.to_s] = v }
  end

  def role_do_usuario(doc)
    FirestoreKeyNormalizer.fetch_field(doc[:data], "role", "perfil", "tipo")
  end

  def texto(value)
    value.nil? ? "" : value.to_s
  end
end
