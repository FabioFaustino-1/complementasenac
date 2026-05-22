# frozen_string_literal: true

require "test_helper"

class FirestoreKeyNormalizerTest < ActiveSupport::TestCase
  test "normalize remove acentos minusculas e caracteres especiais" do
    assert_equal "analiseedesenvolvimentodesistemas", FirestoreKeyNormalizer.normalize("Análise-e-Desenvolvimento_de Sistemas")
    assert_equal "pendente", FirestoreKeyNormalizer.normalize("PENDENTE")
    assert_equal "ensino", FirestoreKeyNormalizer.normalize("Ensino")
  end

  test "fetch_field encontra chave normalizada no hash" do
    hash = { "ensino" => 10, "idcurso" => "ads" }
    assert_equal 10, FirestoreKeyNormalizer.fetch_numeric(hash, "Ensino")
    assert_equal "ads", FirestoreKeyNormalizer.fetch_field(hash, "id_curso")
  end

  test "role_matches compara roles normalizadas" do
    assert FirestoreKeyNormalizer.role_matches?("ALUNO", "aluno")
    assert FirestoreKeyNormalizer.role_matches?("superadmin", "admin")
  end
end
