# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ::JsonCamelCase
  include ::FirebaseAuthenticatable
  include ::ApiErrorHandler
end
