# frozen_string_literal: true

module Api
  module Admin
    class CursosController < BaseController
      def index
        render_camel_json(admin_curso_service.listar)
      end

      def show
        curso = admin_curso_service.buscar_por_id(params[:id_curso])
        if curso
          render_camel_json(curso)
        else
          head :not_found
        end
      end

      def create
        curso = admin_curso_service.criar(payload_hash.symbolize_keys)
        render_camel_json(curso, status: :created)
      end

      def update
        curso = admin_curso_service.atualizar(params[:id_curso], payload_hash.symbolize_keys)
        if curso
          render_camel_json(curso)
        else
          head :not_found
        end
      end
    end
  end
end
