Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    match "auth/me", to: "auth#me", via: %i[get options]

    get "usuario", to: "aluno#usuario"

    scope :aluno do
      get "perfil", to: "aluno#perfil"
      get "resumo", to: "aluno#resumo"
      get "atividades/recentes", to: "aluno#atividades_recentes"
      match "atividades", to: "aluno#atividades", via: %i[get post]
    end

    scope :coordenador do
      get "atividades", to: "coordenador#atividades"
      get "atividades/todas", to: "coordenador#atividades_todas"
      post "atividades/:id/decisao", to: "coordenador#decisao"
      get "resumo", to: "coordenador#resumo"
      get "perfil", to: "coordenador#perfil"
      get "alunos", to: "coordenador#alunos"
    end

    namespace :admin do
      resources :alunos, only: %i[index show create update destroy]
      resources :coordenadores, only: %i[index show create update destroy]
      resources :cursos, only: %i[index show create update], param: :id_curso
    end
  end
end
