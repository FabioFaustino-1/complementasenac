# frozen_string_literal: true

module Api
  class CoordenadorController < ApplicationController
    include FirestoreApiBase

    before_action :require_usuario_doc!, only: %i[perfil]

    def atividades
      render_camel_json(coordenador_service.listar_pendentes)
    end

    def atividades_todas
      render_camel_json(coordenador_service.listar_todas)
    end

    def decisao
      payload = payload_hash
      status = payload[:status].to_s.upcase.presence || "PENDENTE"
      horas = payload[:horasAprovadas]
      horas_aprovadas = horas.present? ? horas.to_i : nil
      justificativa = payload[:justificativa]

      result = coordenador_service.decidir(
        params[:id],
        status,
        horas_aprovadas: horas_aprovadas,
        justificativa: justificativa
      )

      if result
        render_camel_json(result)
      else
        head :not_found
      end
    end

    def resumo
      render_camel_json(coordenador_service.resumo)
    end

    def perfil
      render_camel_json(
        coordenador_service.perfil(current_uid, current_email, usuario_doc: current_usuario_doc)
      )
    end

    def alunos
      render_camel_json(admin_aluno_service.listar)
    end
  end
end
