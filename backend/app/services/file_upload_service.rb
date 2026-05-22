# frozen_string_literal: true

require "base64"
require "google/cloud/storage"
require "securerandom"

class FileUploadService
  def upload_data_url(data_url, uid_aluno)
    return nil if data_url.blank?
    return data_url unless data_url.start_with?("data:")

    split = data_url.index(",")
    raise ArgumentError, "Comprovante invalido." unless split

    metadata = data_url[5...split]
    base64_content = data_url[(split + 1)..]
    content_type = metadata.include?(";") ? metadata.split(";").first : "application/octet-stream"
    extensao = content_type.include?("/") ? content_type.split("/").last : "bin"

    bytes = Base64.decode64(base64_content)
    bucket_name = resolver_bucket_existente
    object_name = format("solicitacoes/%s/%s.%s", uid_aluno, SecureRandom.uuid, extensao)

    storage = Google::Cloud::Storage.new(
      project_id: Rails.application.config.firebase[:project_id],
      credentials: Rails.application.config.firebase[:credentials_path]
    )
    bucket = storage.bucket(bucket_name)
    bucket.create_file(StringIO.new(bytes), object_name, content_type: content_type)

    "https://storage.googleapis.com/#{bucket_name}/#{object_name}"
  end

  private

  def resolver_bucket_existente
    cfg = Rails.application.config.firebase
    project_id = cfg[:project_id]
    candidatos = []
    candidatos << cfg[:storage_bucket] if cfg[:storage_bucket].present?
    candidatos << "#{project_id}.firebasestorage.app" if project_id.present?
    candidatos << "#{project_id}.appspot.com" if project_id.present?

    storage = Google::Cloud::Storage.new(
      project_id: project_id,
      credentials: cfg[:credentials_path]
    )

    candidatos.uniq.each do |nome|
      return nome if storage.bucket(nome)
    end

    raise ArgumentError, "Bucket do Firebase Storage nao encontrado."
  end
end
