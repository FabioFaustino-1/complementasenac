# frozen_string_literal: true

# Firestore armazena IDs, nomes de campos e alguns valores em formato
# minusculo, sem acentos e sem caracteres especiais (hifens, underscores, etc.).
module FirestoreKeyNormalizer
  module_function

  def normalize(value)
    return "" if value.nil?

    text = value.to_s.strip
    return "" if text.empty?

    text.unicode_normalize(:nfd)
        .gsub(/\p{Mn}/, "")
        .downcase
        .gsub(/[^a-z0-9]/, "")
  end

  def document_id_candidates(id)
    return [] if id.nil?

    raw = id.to_s.strip
    return [] if raw.empty?

    norm = normalize(raw)
    [raw, norm].uniq.reject(&:empty?)
  end

  def fetch_field(hash, *keys)
    return nil unless hash.is_a?(Hash)

    keys.flatten.each do |key|
      variants = [key, key.to_s, normalize(key)].uniq
      hash.each do |k, v|
        k_variants = [k, k.to_s, normalize(k)]
        next unless (variants & k_variants).any?

        return v
      end
    end

    nil
  end

  def fetch_numeric(hash, *keys)
    val = fetch_field(hash, *keys)
    return 0 if val.nil?

    val.is_a?(Numeric) ? val.to_i : val.to_s.to_i
  end

  def role_matches?(doc_role, target_role)
    normalize_role_for_db(doc_role) == normalize_role_for_db(target_role)
  end

  def status_matches?(doc_status, target_status)
    normalize(doc_status) == normalize(target_status)
  end

  def normalize_status_for_db(status)
    normalize(status).presence || "pendente"
  end

  def normalize_role_for_db(role)
    role = normalize(role)
    return "admin" if role == "superadmin"

    role
  end

  def saldo_key_for_categoria(categoria)
    key = normalize(categoria)
    return "ensino" if key.start_with?("ens")
    return "pesquisa" if key.start_with?("pes")

    "extensao"
  end

  def deep_normalize_keys(hash)
    return hash unless hash.is_a?(Hash)

    hash.each_with_object({}) do |(k, v), acc|
      key = normalize(k)
      acc[key] = v.is_a?(Hash) ? deep_normalize_keys(v) : v
    end
  end
end
