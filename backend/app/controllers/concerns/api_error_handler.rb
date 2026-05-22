# frozen_string_literal: true

module ApiErrorHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ArgumentError, with: :render_bad_request
    rescue_from Timeout::Error, with: :render_timeout
    rescue_from StandardError, with: :render_internal_error unless Rails.env.development?
  end

  def render_standard_error(status, error_title, message)
    render json: {
      timestamp: (Time.current.to_f * 1000).to_i,
      status: Rack::Utils.status_code(status),
      error: error_title,
      message: message,
      path: request.path
    }, status: status
  end

  private

  def render_bad_request(exception)
    Rails.logger.warn("Requisicao invalida em #{request.path}: #{exception.message}")
    render_standard_error(:bad_request, "Dados invalidos", exception.message)
  end

  def render_internal_error(exception)
    Rails.logger.error("Erro em #{request.path}: #{exception.message}\n#{exception.backtrace&.first(5)&.join("\n")}")
    render_standard_error(:internal_server_error, "Erro interno", exception.message)
  end

  def render_timeout(exception)
    Rails.logger.warn("Timeout em #{request.path}: #{exception.message}")
    render_standard_error(:service_unavailable, "Servico indisponivel", "Tempo esgotado ao acessar servico externo.")
  end

end
