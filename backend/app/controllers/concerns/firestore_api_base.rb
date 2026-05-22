# frozen_string_literal: true

module FirestoreApiBase
  extend ActiveSupport::Concern
  include CurrentFirestoreUser

  private

  def require_usuario_doc!
    return if current_usuario_doc

    render_standard_error(:not_found, "Usuario nao encontrado", "Usuario nao encontrado no banco.")
  end

  def perfil_service
    @perfil_service ||= PerfilService.new(firestore_service: firestore_service)
  end

  def aluno_service
    @aluno_service ||= AlunoService.new(firestore_service: firestore_service)
  end

  def coordenador_service
    @coordenador_service ||= CoordenadorService.new(firestore_service: firestore_service)
  end

  def admin_aluno_service
    @admin_aluno_service ||= AdminAlunoService.new(
      firestore_service: firestore_service,
      firebase_auth_client: firebase_auth_client
    )
  end

  def admin_coordenador_service
    @admin_coordenador_service ||= AdminCoordenadorService.new(
      firestore_service: firestore_service,
      firebase_auth_client: firebase_auth_client
    )
  end

  def admin_curso_service
    @admin_curso_service ||= AdminCursoService.new(firestore_service: firestore_service)
  end

  def firebase_auth_client
    @firebase_auth_client ||= FirebaseAuthClient.new
  end

  def payload_hash
    request_hash.with_indifferent_access
  end
end
