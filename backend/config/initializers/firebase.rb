credentials_path = Rails.root.join("config/firebase/credentials.json")

if credentials_path.exist?
  raw = JSON.parse(credentials_path.read)
  Rails.application.config.firebase = {
    credentials_path: credentials_path.to_s,
    project_id: raw["project_id"],
    storage_bucket: ENV.fetch("FIREBASE_STORAGE_BUCKET", "#{raw['project_id']}.firebasestorage.app"),
    credentials: raw
  }.freeze
else
  Rails.logger.warn("[Firebase] Credenciais nao encontradas em #{credentials_path}")
  Rails.application.config.firebase = {
    credentials_path: nil,
    project_id: ENV["FIREBASE_PROJECT_ID"],
    storage_bucket: ENV["FIREBASE_STORAGE_BUCKET"],
    credentials: nil
  }.freeze
end
