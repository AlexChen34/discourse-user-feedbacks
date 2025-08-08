# frozen_string_literal: true
# name: discourse-user-feedbacks
# about: Allow users to give feedback to fellow users
# version: 2.0.1
# authors: Ahmed Gagan
# url: https://github.com/AlexChen34/discourse-user-feedbacks
# required_version: 3.1.0

enabled_site_setting :user_feedbacks_enabled

register_asset 'stylesheets/user-feedbacks.scss'

after_initialize do
  begin
    module ::DiscourseUserFeedbacks
      PLUGIN_NAME ||= 'discourse-user-feedbacks'

      class Engine < ::Rails::Engine
        engine_name PLUGIN_NAME
        isolate_namespace DiscourseUserFeedbacks
      end
    end

    # Load plugin files with error handling
    [
      'app/models/user_feedback',
      'app/serializers/user_feedback_serializer',
      'app/controllers/user_feedbacks_controller',
      'app/controllers/admin/user_feedbacks_controller',
      'lib/discourse_user_feedbacks/user_extension',
      'lib/discourse_user_feedbacks/user_feedbacks_constraint'
    ].each do |file|
      begin
        require_relative file
      rescue LoadError => e
        Rails.logger.warn "Failed to load #{file}: #{e.message}"
      rescue => e
        Rails.logger.error "Error loading #{file}: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
      end
    end

    # Routes
    Discourse::Application.routes.append do
      namespace :discourse_user_feedbacks, path: '/user-feedbacks' do
        resources :user_feedbacks, only: [:create, :update, :destroy, :index]
      end
      
      get "/u/:username/user-feedbacks" => "discourse_user_feedbacks/user_feedbacks#show", 
          constraints: DiscourseUserFeedbacks::UserFeedbacksConstraint.new
      
      get "/admin/plugins/user-feedbacks" => "admin/plugins#index", 
          constraints: AdminConstraint.new
    end

    # Admin route
    add_admin_route 'discourse_user_feedbacks.admin.title', 'user-feedbacks'

    # User serializer extension
    add_to_serializer(:user, :feedbacks_received_count) do
      object.user_feedbacks_received&.count || 0
    end

    add_to_serializer(:user, :average_rating) do
      feedbacks = object.user_feedbacks_received
      return 0 if feedbacks.blank?
      
      total_rating = feedbacks.sum(:rating)
      count = feedbacks.count
      count > 0 ? (total_rating.to_f / count).round(1) : 0
    end

  rescue => e
    Rails.logger.error "Error initializing discourse-user-feedbacks plugin: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
  end
end
