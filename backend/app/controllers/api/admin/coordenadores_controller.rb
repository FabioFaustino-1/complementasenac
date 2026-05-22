# frozen_string_literal: true

module Api
  module Admin
    class CoordenadoresController < BaseController
      def index
        render_camel_json(admin_coordenador_service.listar)
      end

      def show
        coord = admin_coordenador_service.buscar_por_id(params[:id])
        if coord
          render_camel_json(coord)
        else
          head :not_found
        end
      end

      def create
        coord = admin_coordenador_service.criar(payload_hash.symbolize_keys)
        render_camel_json(coord, status: :created)
      end

      def update
        coord = admin_coordenador_service.atualizar(params[:id], payload_hash.symbolize_keys)
        if coord
          render_camel_json(coord)
        else
          head :not_found
        end
      end

      def destroy
        if admin_coordenador_service.remover(params[:id])
          head :no_content
        else
          head :not_found
        end
      end
    end
  end
end
