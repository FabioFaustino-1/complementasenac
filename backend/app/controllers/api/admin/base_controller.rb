# frozen_string_literal: true

module Api
  module Admin
    class BaseController < ApplicationController
      include FirestoreApiBase

      before_action :require_usuario_doc!
    end
  end
end
