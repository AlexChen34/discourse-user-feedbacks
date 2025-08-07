# frozen_string_literal: true

module DiscourseUserFeedbacks
  class UserFeedbacksController < ::ApplicationController
    requires_login

    PAGE_SIZE = 30

    def create
      # Support both nested and flat parameter formats for compatibility
      if params[:user_feedback].present?
        feedback_params = params.require(:user_feedback).permit(:rating, :feedback_to_id, :review)
      else
        # Fallback for legacy format
        feedback_params = params.permit(:rating, :feedback_to_id, :review)
      end
      
      raise Discourse::InvalidParameters.new(:rating) if feedback_params[:rating].to_i <= 0
      raise Discourse::InvalidParameters.new(:feedback_to_id) if feedback_params[:feedback_to_id].to_i <= 0

      feedback_params[:user_id] = current_user.id

      feedback = DiscourseUserFeedbacks::UserFeedback.create!(feedback_params)

      render_serialized(feedback, UserFeedbackSerializer)
    rescue ActiveRecord::RecordInvalid => e
      render_json_error(e.message, status: 422)
    end

    def update
      feedback_params = params.require(:user_feedback).permit(:rating, :feedback_to_id, :review)
      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])

      raise Discourse::InvalidParameters.new(:rating) if feedback_params[:rating] && feedback_params[:rating].to_i <= 0

      feedback_params[:user_id] = current_user.id
      feedback.update!(feedback_params)

      render_serialized(feedback, UserFeedbackSerializer)
    rescue ActiveRecord::RecordInvalid => e
      render_json_error(e.message, status: 422)
    end

    def destroy
      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])
      feedback.destroy!

      render_serialized(feedback, UserFeedbackSerializer)
    rescue ActiveRecord::RecordNotFound
      render_json_error(I18n.t("not_found"), status: 404)
    end

    def index
      raise Discourse::InvalidParameters.new(:feedback_to_id) if params.key?(:feedback_to_id) && params[:feedback_to_id].to_i <= 0

      page = [params[:page].to_i, 1].max
      feedbacks = DiscourseUserFeedbacks::UserFeedback.order(created_at: :desc)

      feedbacks = feedbacks.where(feedback_to_id: params[:feedback_to_id]) if params[:feedback_to_id]
      feedbacks = feedbacks.where(user_id: current_user.id) if SiteSetting.user_feedbacks_hide_feedbacks_from_user && !current_user.admin?

      count = feedbacks.count
      feedbacks = feedbacks.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)

      render_json_dump({ 
        count: count, 
        feedbacks: serialize_data(feedbacks, UserFeedbackSerializer),
        page: page,
        total_pages: (count.to_f / PAGE_SIZE).ceil
      })
    end

    def show
      params.require(:id)

      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])

      render_serialized(feedback, UserFeedbackSerializer)
    end
  end
end
