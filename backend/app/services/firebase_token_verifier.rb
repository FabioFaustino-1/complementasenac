# frozen_string_literal: true

require "jwt"
require "net/http"
require "openssl"
require "timeout"

class FirebaseTokenVerifier
  CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  CERTS_TTL = 12.hours

  @certs_cache = {}
  @certs_fetched_at = nil
  @certs_mutex = Mutex.new

  def initialize(project_id: Rails.application.config.firebase[:project_id])
    @project_id = project_id
  end

  def verify!(token)
    raise ArgumentError, "Token ausente" if token.blank?

    begin
      payload, = Timeout.timeout(8) do
        JWT.decode(
          token,
          nil,
          true,
          {
            algorithms: ["RS256"],
            iss: "https://securetoken.google.com/#{@project_id}",
            verify_iss: true,
            aud: @project_id,
            verify_aud: true
          }
        ) do |headers|
          public_key(headers["kid"])
        end
      end
    rescue Timeout::Error, JWT::DecodeError => e
      raise e unless Rails.env.development?

      Rails.logger.warn("[Firebase] Validacao completa indisponivel em desenvolvimento: #{e.message}")
      payload = decode_without_signature!(token)
    end

    payload
  end

  private

  def public_key(kid)
    refresh_certs! if certs_cache.empty? || certs_expired?

    cert_pem = certs_cache[kid]
    raise JWT::DecodeError, "Certificado Firebase nao encontrado" unless cert_pem

    OpenSSL::X509::Certificate.new(cert_pem).public_key
  end

  def refresh_certs!
    self.class.instance_variable_get(:@certs_mutex).synchronize do
      return unless certs_cache.empty? || certs_expired?

      uri = URI(CERTS_URL)
      response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 4, read_timeout: 4) do |http|
        http.get(uri.request_uri)
      end
      raise JWT::DecodeError, "Falha ao buscar certificados Firebase" unless response.is_a?(Net::HTTPSuccess)

      self.class.instance_variable_set(:@certs_cache, JSON.parse(response.body))
      self.class.instance_variable_set(:@certs_fetched_at, Time.current)
    end
  end

  def certs_expired?
    fetched_at = self.class.instance_variable_get(:@certs_fetched_at)
    fetched_at.nil? || fetched_at < CERTS_TTL.ago
  end

  def certs_cache
    self.class.instance_variable_get(:@certs_cache)
  end

  def decode_without_signature!(token)
    payload, = JWT.decode(token, nil, false)
    aud = payload["aud"]
    iss = payload["iss"]
    expected_iss = "https://securetoken.google.com/#{@project_id}"

    raise JWT::DecodeError, "Audiencia invalida" if @project_id.present? && aud != @project_id
    raise JWT::DecodeError, "Emissor invalido" if @project_id.present? && iss != expected_iss

    payload
  end
end
