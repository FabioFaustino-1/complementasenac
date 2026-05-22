# frozen_string_literal: true

require "timeout"

module FirebaseAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_firebase_token!
    skip_before_action :authenticate_firebase_token!, if: -> { request.path == "/up" }
    attr_reader :current_uid, :current_email
  end

  private

  def authenticate_firebase_token!
    if request.method == "OPTIONS"
      head :ok
      return false
    end

    header = request.headers["Authorization"]
    if header.present? && header.start_with?("Bearer ")
      token = header.delete_prefix("Bearer ").strip
      begin
        payload = Timeout.timeout(5) { FirebaseTokenVerifier.new.verify!(token) }
        @current_uid = payload["user_id"] || payload["sub"]
        @current_email = payload["email"]
        request.env["firebase.uid"] = @current_uid
        request.env["firebase.email"] = @current_email
        return
      rescue StandardError => e
        Rails.logger.warn("[Firebase] Falha ao validar token: #{e.class} - #{e.message}")
        if auth_required_path?
          render json: { error: "Token invalido" }, status: :unauthorized
          return false
        end
      end
    end

    if auth_required_path?
      render json: { error: "Token ausente" }, status: :unauthorized
      false
    end
  end

  def auth_required_path?
    request.path.start_with?("/api/auth/")
  end

  def current_uid
    @current_uid.to_s
  end

  def current_email
    @current_email.to_s
  end
end
