# frozen_string_literal: true

DiscourseUserFeedbacks::Engine.routes.draw do
  resources :user_feedbacks, constraints: DiscourseUserFeedbacks::UserFeedbacksConstraint.new
  
  # User feedback routes
  %w{users u}.each do |root_path|
    get "#{root_path}/:username/feedbacks" => "user_feedbacks#index", constraints: { username: RouteFormat.username }
  end
  
  # Admin routes
  namespace :admin do
    resources :user_feedbacks, only: [:index, :show, :update, :destroy] do
      collection do
        get :stats
      end
    end
  end
end
