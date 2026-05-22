# frozen_string_literal: true

module Api
  class AuthController < ApplicationController
    include FirestoreApiBase

    def me
      render_camel_json(
        uid: current_uid,
        email: current_email,
        perfil: perfil_service.resolver_perfil(current_uid, current_email)
      )
    rescue Timeout::Error
      raise Timeout::Error, "Tempo esgotado ao consultar Firestore."
    end
  end
end
