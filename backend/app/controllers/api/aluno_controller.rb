# frozen_string_literal: true

module Api
  class AlunoController < ApplicationController
    include FirestoreApiBase

    before_action :require_usuario_doc!, except: [:usuario]

    def usuario
      render_camel_json(
        uid: current_uid,
        email: current_email,
        perfil: perfil_service.resolver_perfil(current_uid, current_email)
      )
    end

    def perfil
      render_camel_json(
        aluno_service.buscar_perfil(current_uid, current_email, usuario_doc: current_usuario_doc)
      )
    end

    def resumo
      render_camel_json(
        aluno_service.buscar_resumo(current_uid, current_email, usuario_doc: current_usuario_doc)
      )
    end

    def atividades_recentes
      render_camel_json(
        aluno_service.listar_recentes(3, current_uid, current_email, usuario_doc: current_usuario_doc)
      )
    end

    def atividades
      if request.post?
        criar_atividade
      else
        render_camel_json(
          aluno_service.listar_historico(current_uid, current_email, usuario_doc: current_usuario_doc)
        )
      end
    end

    private

    def criar_atividade
      atividade = aluno_service.submeter_atividade(request_hash, current_uid, current_email)
      render_camel_json(atividade, status: :created)
    end
  end
end
