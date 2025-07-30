# frozen_string_literal: true

module DiscourseUserFeedbacks
  class UserFeedbacksController < ::ApplicationController
    requires_login

    PAGE_SIZE = 30

    def create
      params.require([:rating, :feedback_to_id])
      params.permit(:review)

      raise Discourse::InvalidParameters.new(:rating) if params[:rating].to_i <= 0
      raise Discourse::InvalidParameters.new(:feedback_to_id) if params[:feedback_to_id].to_i <= 0

      opts = {
        rating: params[:rating],
        feedback_to_id: params[:feedback_to_id]
      }

      opts[:review] = params[:review] if params.key?(:review) && params[:review]

      opts[:user_id] = current_user.id

      # Prevent users from giving feedback to themselves
      if opts[:feedback_to_id].to_i == current_user.id
        raise Discourse::InvalidParameters.new("Cannot give feedback to yourself")
      end

      # Check if user already gave feedback to this user
      existing_feedback = DiscourseUserFeedbacks::UserFeedback.find_by(
        user_id: current_user.id,
        feedback_to_id: opts[:feedback_to_id]
      )
      
      if existing_feedback
        raise Discourse::InvalidParameters.new("You have already given feedback to this user")
      end

      feedback = DiscourseUserFeedbacks::UserFeedback.create!(opts)

      render_serialized(feedback, UserFeedbackSerializer)
    end

    def update
      params.require(:id).permit(:rating, :feedback_to_id, :review)

      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])

      opts = {
        rating: params[:rating],
        feedback_to_id: params[:feedback_to_id]
      }

      raise Discourse::InvalidParameters.new(:rating) if params[:rating] && params[:rating].to_i <= 0

      opts[:rating] = params[:rating] if params.key?(:rating) && params[:rating]
      opts[:review] = params[:review] if params.key?(:review) && params[:review]
      opts[:user_id] = current_user.id

      feedback.update!(opts)

      render_serialized(feedback, UserFeedbackSerializer)
    end

    def destroy
      params.require(:id)

      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])
      
      # Only allow users to delete their own feedback or admins
      unless feedback.user_id == current_user.id || current_user.admin?
        raise Discourse::InvalidAccess.new
      end
      
      feedback.destroy

      render_serialized(feedback, UserFeedbackSerializer)
    end

    def index
      raise Discourse::InvalidParameters.new(:feedback_to_id) if params.key?(:feedback_to_id) && params[:feedback_to_id].to_i <= 0

      page = [params[:page].to_i, 0].max

      feedbacks = DiscourseUserFeedbacks::UserFeedback.order(created_at: :desc)

      feedbacks = feedbacks.where(feedback_to_id: params[:feedback_to_id]) if params[:feedback_to_id]

      feedbacks = feedbacks.where(user_id: current_user.id) if SiteSetting.user_feedbacks_hide_feedbacks_from_user && !current_user.admin

      count = feedbacks.count

      feedbacks = feedbacks.offset(page * PAGE_SIZE).limit(PAGE_SIZE)

      render_json_dump({ count: count, feedbacks: serialize_data(feedbacks, UserFeedbackSerializer) })
    end

    def show
      params.require(:id)

      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])

      render_serialized(feedback, UserFeedbackSerializer)
    end
  end
end
