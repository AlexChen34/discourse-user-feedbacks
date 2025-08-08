# frozen_string_literal: true

module DiscourseUserFeedbacks
  class Admin::UserFeedbacksController < ::ApplicationController
    requires_login
    before_action :ensure_staff

    def index
      page = [params[:page].to_i, 1].max
      per_page = 50

      feedbacks = DiscourseUserFeedbacks::UserFeedback
        .joins("LEFT JOIN users feedback_giver ON user_feedbacks.user_id = feedback_giver.id")
        .joins("LEFT JOIN users feedback_receiver ON user_feedbacks.feedback_to_id = feedback_receiver.id")
        .select("user_feedbacks.*, 
                 feedback_giver.username as giver_username,
                 feedback_receiver.username as receiver_username")
        .order(created_at: :desc)

      # Filter options
      if params[:user_id].present?
        feedbacks = feedbacks.where(user_id: params[:user_id])
      end

      if params[:feedback_to_id].present?
        feedbacks = feedbacks.where(feedback_to_id: params[:feedback_to_id])
      end

      if params[:rating].present?
        feedbacks = feedbacks.where(rating: params[:rating])
      end

      if params[:search].present?
        search_term = "%#{params[:search]}%"
        feedbacks = feedbacks.where(
          "feedback_giver.username ILIKE ? OR feedback_receiver.username ILIKE ? OR user_feedbacks.review ILIKE ?",
          search_term, search_term, search_term
        )
      end

      total_count = feedbacks.count
      feedbacks = feedbacks.offset((page - 1) * per_page).limit(per_page)

      render_json_dump({
        feedbacks: serialize_data(feedbacks, UserFeedbackSerializer),
        total_count: total_count,
        page: page,
        per_page: per_page,
        total_pages: (total_count.to_f / per_page).ceil
      })
    end

    def show
      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])
      render_serialized(feedback, UserFeedbackSerializer)
    end

    def update
      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])
      feedback_params = params.require(:user_feedback).permit(:rating, :review, :visible)
      
      if feedback.update(feedback_params)
        StaffActionLogger.new(current_user).log_custom(
          'user_feedback_modified',
          {
            feedback_id: feedback.id,
            giver: feedback.user.username,
            receiver: feedback.feedback_to.username,
            rating: feedback.rating,
            details: "Modified by admin"
          }
        )
        
        render_serialized(feedback, UserFeedbackSerializer)
      else
        render_json_error(feedback.errors.full_messages.join(', '), status: 422)
      end
    end

    def destroy
      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])
      
      StaffActionLogger.new(current_user).log_custom(
        'user_feedback_deleted',
        {
          feedback_id: feedback.id,
          giver: feedback.user.username,
          receiver: feedback.feedback_to.username,
          rating: feedback.rating,
          review: feedback.review.to_s[0..100],
          details: "Deleted by admin"
        }
      )
      
      feedback.destroy!
      render json: success_json
    end

    def stats
      stats = {
        total_feedbacks: DiscourseUserFeedbacks::UserFeedback.count,
        average_rating: DiscourseUserFeedbacks::UserFeedback.average(:rating)&.round(2) || 0,
        ratings_distribution: DiscourseUserFeedbacks::UserFeedback.group(:rating).count,
        recent_feedbacks: DiscourseUserFeedbacks::UserFeedback
          .where('created_at > ?', 30.days.ago)
          .count,
        top_rated_users: User.joins("LEFT JOIN user_feedbacks ON users.id = user_feedbacks.feedback_to_id")
          .group("users.id, users.username")
          .having("COUNT(user_feedbacks.id) >= 3")
          .order("AVG(user_feedbacks.rating) DESC")
          .limit(10)
          .pluck("users.username, AVG(user_feedbacks.rating), COUNT(user_feedbacks.id)")
          .map { |username, avg_rating, count| 
            { username: username, average_rating: avg_rating.round(2), feedback_count: count }
          }
      }

      render json: stats
    end

    private

    def ensure_staff
      raise Discourse::InvalidAccess unless current_user&.staff?
    end
  end
end
