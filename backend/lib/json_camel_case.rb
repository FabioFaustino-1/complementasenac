# frozen_string_literal: true

module JsonCamelCase
  extend ActiveSupport::Concern

  private

  def render_camel_json(data, **options)
    raise ArgumentError, "Dados JSON ausentes." if data.nil?

    render json: camelize_keys(data), **options
  end

  def camelize_keys(value)
    case value
    when Hash
      value.each_with_object({}) do |(k, v), h|
        h[k.to_s.camelize(:lower)] = camelize_keys(v)
      end
    when Array
      value.map { |item| camelize_keys(item) }
    else
      value
    end
  end

  def request_hash
    body = request.request_parameters
    return body if body.is_a?(Hash) && body.present?

    params.to_unsafe_h.except(
      "controller", "action", "format",
      "aluno", "coordenador", "coordenadores", "curso", "cursos"
    )
  end
end
