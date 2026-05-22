# frozen_string_literal: true

require "googleauth"
require "net/http"
require "json"

class FirebaseAuthClient
  SCOPE = "https://www.googleapis.com/auth/identitytoolkit"

  def initialize(project_id: Rails.application.config.firebase[:project_id],
                 credentials_path: Rails.application.config.firebase[:credentials_path])
    @project_id = project_id
    @credentials_path = credentials_path
  end

  def upsert_user(preferred_uid:, email:, display_name:, password:)
    normalized_email = email.to_s.strip.downcase
    normalized_name = display_name.to_s.strip
    normalized_password = password.to_s.strip

    if preferred_uid.present?
      upsert_by_uid(preferred_uid, normalized_email, normalized_name, normalized_password)
    else
      existing = find_by_email(normalized_email)
      if existing
        update_user(existing["localId"], normalized_email, normalized_name, normalized_password)
        existing["localId"]
      else
        create_user(email: normalized_email, display_name: normalized_name, password: normalized_password)
      end
    end
  end

  def delete_by_uid(uid)
    return if uid.blank?

    request(
      :post,
      "accounts:delete",
      { localId: uid }
    )
  rescue StandardError => e
    raise ArgumentError, "Falha ao remover usuario do Firebase Auth." unless e.message.include?("USER_NOT_FOUND")
  end

  private

  def upsert_by_uid(uid, email, display_name, password)
    by_email = find_by_email(email)
    if by_email && by_email["localId"] != uid
      raise ArgumentError, "Ja existe um usuario com este e-mail no Firebase Auth."
    end

    current = find_by_uid(uid)
    if current
      update_user(uid, email, display_name, password)
      uid
    else
      create_user(uid: uid, email: email, display_name: display_name, password: password)
    end
  end

  def find_by_uid(uid)
    response = request(:post, "accounts:lookup", { localId: [uid] })
    users = response["users"] || []
    users.first
  rescue StandardError
    nil
  end

  def find_by_email(email)
    response = request(:post, "accounts:lookup", { email: [email] })
    users = response["users"] || []
    users.first
  rescue StandardError
    nil
  end

  def create_user(email:, display_name:, password:, uid: nil)
    body = {
      email: email,
      displayName: display_name,
      password: password,
      emailVerified: false
    }
    body[:localId] = uid if uid.present?

    response = request(:post, "accounts", body)
    response["localId"]
  end

  def update_user(uid, email, display_name, password)
    request(
      :post,
      "accounts:update",
      {
        localId: uid,
        email: email,
        displayName: display_name,
        password: password,
        returnSecureToken: false
      }
    )
    uid
  end

  def request(method, path, body)
    uri = URI("https://identitytoolkit.googleapis.com/v1/projects/#{@project_id}/#{path}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    req = method == :post ? Net::HTTP::Post.new(uri) : Net::HTTP::Get.new(uri)
    req["Authorization"] = "Bearer #{access_token}"
    req["Content-Type"] = "application/json"
    req.body = body.to_json

    response = http.request(req)
    parsed = JSON.parse(response.body) rescue {}

    unless response.is_a?(Net::HTTPSuccess)
      message = parsed.dig("error", "message") || response.message
      raise ArgumentError, "Falha ao sincronizar usuario no Firebase Auth: #{message}"
    end

    parsed
  end

  def access_token
    authorizer = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(@credentials_path),
      scope: SCOPE
    )
    authorizer.fetch_access_token!
    authorizer.access_token
  end
end
