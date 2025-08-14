# frozen_string_literal: true
# name: discourse-user-feedbacks
# about: allow user to give feedback to fellow users
# version: 1.0.0
# authors: Ahmed Gagan
# url: https://github.com/Ahmedgagan/discourse-user-feedbacks

enabled_site_setting :user_feedbacks_enabled

if respond_to?(:register_svg_icon)
  register_svg_icon "fas fa-star"
end

register_asset 'stylesheets/user-feedbacks.scss'

after_initialize do
  module ::DiscourseUserFeedbacks
    PLUGIN_NAME ||= 'discourse-user-feedbacks'

    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscourseUserFeedbacks
    end
  end

  [
    "../app/controllers/user_feedbacks_controller.rb",
    "../app/serializers/user_feedback_serializer.rb",
    "../app/models/user_feedback.rb",
    "../lib/discourse_user_feedbacks/user_extension.rb",
    "../lib/discourse_user_feedbacks/user_feedbacks_constraint.rb",
    "../config/routes"
  ].each { |path| require File.expand_path(path, __FILE__) }

  Discourse::Application.routes.append do
    %w{users u}.each do |root_path|
      get "#{root_path}/:username/feedbacks" => "users#preferences", constraints: { username: RouteFormat.username }
    end
    mount ::DiscourseUserFeedbacks::Engine, at: '/'
  end

  reloadable_patch do |plugin|
    User.class_eval { prepend DiscourseUserFeedbacks::UserExtension }
  end

  add_to_serializer(:basic_user, :feedbacks_to) do
    user = object
    user = object[:user] if object.class != User

    return nil if !user

    return nil if !user.feedbacks

    user.feedbacks.pluck(:feedback_to_id)
  end

  add_to_serializer(:basic_user, :average_rating) do
    user = object
    user = object[:user] if object.class != User

    return nil if !user

    feedbacks = DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: user.id)
    return 0 if feedbacks.count == 0
    
    total = feedbacks.sum(:rating)
    count = feedbacks.count
    (total.to_f / count).round(2)
  end

  add_to_serializer(:basic_user, :rating_count) do
    user = object
    user = object[:user] if object.class != User

    return nil if !user

    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: user.id).count
  end

  add_to_serializer(:basic_user, :positive_count) do
    user = object
    user = object[:user] if object.class != User

    return nil if !user

    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: user.id, rating: 1).count
  end

  add_to_serializer(:basic_user, :neutral_count) do
    user = object
    user = object[:user] if object.class != User

    return nil if !user

    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: user.id, rating: 0).count
  end

  add_to_serializer(:basic_user, :negative_count) do
    user = object
    user = object[:user] if object.class != User

    return nil if !user

    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: user.id, rating: -1).count
  end

  add_to_serializer(:post, :user_average_rating) do
    user = object.user
    feedbacks = DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: user.id)
    return 0 if feedbacks.count == 0
    
    total = feedbacks.sum(:rating)
    count = feedbacks.count
    (total.to_f / count).round(2)
  end

  add_to_serializer(:post, :user_rating_count) do
    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: object.user.id).count
  end

  add_to_serializer(:post, :user_positive_count) do
    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: object.user.id, rating: 1).count
  end

  add_to_serializer(:post, :user_neutral_count) do
    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: object.user.id, rating: 0).count
  end

  add_to_serializer(:post, :user_negative_count) do
    DiscourseUserFeedbacks::UserFeedback.where(feedback_to_id: object.user.id, rating: -1).count
  end
end
