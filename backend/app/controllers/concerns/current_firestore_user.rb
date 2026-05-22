# frozen_string_literal: true

module CurrentFirestoreUser
  extend ActiveSupport::Concern

  private

  def firestore_service
    @firestore_service ||= FirestoreService.new
  end

  def current_usuario_doc
    return @current_usuario_doc if defined?(@current_usuario_doc)

    @current_usuario_doc = firestore_service.buscar_usuario(current_uid, current_email)

    if @current_usuario_doc.nil?
      Rails.logger.warn(
        "[Firestore] Usuario nao encontrado (uid=#{current_uid.presence || 'vazio'}, email=#{current_email.presence || 'vazio'})"
      )
    end

    @current_usuario_doc
  end
end
