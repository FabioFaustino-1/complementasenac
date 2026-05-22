# frozen_string_literal: true

module Api
  module Admin
    class AlunosController < BaseController
      def index
        render_camel_json(admin_aluno_service.listar)
      end

      def show
        aluno = admin_aluno_service.buscar_por_id(params[:id])
        if aluno
          render_camel_json(aluno)
        else
          head :not_found
        end
      end

      def create
        payload = payload_hash
        aluno = admin_aluno_service.criar(
          nome: payload[:nome],
          email: payload[:email],
          matricula: payload[:matricula],
          curso: payload[:curso]
        )
        render_camel_json(aluno, status: :created)
      end

      def update
        payload = payload_hash
        aluno = admin_aluno_service.atualizar(
          params[:id],
          nome: payload[:nome],
          email: payload[:email],
          matricula: payload[:matricula],
          curso: payload[:curso]
        )
        if aluno
          render_camel_json(aluno)
        else
          head :not_found
        end
      end

      def destroy
        if admin_aluno_service.remover(params[:id])
          head :no_content
        else
          head :not_found
        end
      end
    end
  end
end
