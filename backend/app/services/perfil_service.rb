# frozen_string_literal: true

class PerfilService
  def initialize(firestore_service: FirestoreService.new)
    @firestore = firestore_service
  end

  def resolver_perfil(uid, email)
    doc = @firestore.buscar_usuario(uid, email)
    raise ArgumentError, "Usuario nao encontrado no banco de dados." unless doc

    normalizar_role(valor_perfil(doc))
  end

  private

  def valor_perfil(doc)
    data = doc[:data]
    FirestoreKeyNormalizer.fetch_field(data, "role", "perfil", "tipo")
  end

  def normalizar_role(role)
    raise ArgumentError, "Usuario sem role configurada no banco." if role.blank?

    normalizado = FirestoreKeyNormalizer.normalize_role_for_db(role)
    return "admin" if normalizado == "superadmin"

    unless %w[coordenador aluno admin].include?(normalizado)
      raise ArgumentError, "Role invalida no banco: #{role}"
    end

    normalizado
  end
end
