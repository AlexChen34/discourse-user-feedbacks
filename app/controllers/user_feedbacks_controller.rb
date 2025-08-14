# frozen_string_literal: true

module DiscourseUserFeedbacks
  class UserFeedbacksController < ::ApplicationController
    requires_login

    PAGE_SIZE = 30

    def create
      params.require([:rating, :feedback_to_id])
      params.permit(:review)

      # Validate new rating system (-1, 0, 1)
      rating_value = params[:rating].to_i
      raise Discourse::InvalidParameters.new(:rating) unless [-1, 0, 1].include?(rating_value)
      raise Discourse::InvalidParameters.new(:feedback_to_id) if params[:feedback_to_id].to_i <= 0

      # Check if user already rated this person today
      existing_today = DiscourseUserFeedbacks::UserFeedback.where(
        user_id: current_user.id,
        feedback_to_id: params[:feedback_to_id],
        created_at: Date.current.beginning_of_day..Date.current.end_of_day
      ).exists?

      if existing_today
        return render_json_error("You can only rate a user once per day", status: 422)
      end

      opts = {
        rating: rating_value,
        feedback_to_id: params[:feedback_to_id],
        user_id: current_user.id
      }

      opts[:review] = params[:review] if params.has_key?(:review) && params[:review]

      feedback = DiscourseUserFeedbacks::UserFeedback.create!(opts)

      render_serialized(feedback, UserFeedbackSerializer)
    rescue ActiveRecord::RecordInvalid => e
      render_json_error(e.record.errors.full_messages.join(", "), status: 422)
    end

    def update
      params.require(:id)
      params.permit(:rating, :review)

      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])

      # Only admins can modify ratings
      unless current_user.admin? || current_user.moderator?
        return render_json_error("Only administrators can modify ratings", status: 403)
      end

      opts = {}
      
      if params.has_key?(:rating)
        rating_value = params[:rating].to_i
        raise Discourse::InvalidParameters.new(:rating) unless [-1, 0, 1].include?(rating_value)
        opts[:rating] = rating_value
        opts[:admin_modified] = true
        opts[:admin_modified_by] = current_user.id
        opts[:admin_modified_at] = Time.current
      end

      opts[:review] = params[:review] if params.has_key?(:review)

      feedback.update!(opts)

      render_serialized(feedback, UserFeedbackSerializer)
    rescue ActiveRecord::RecordInvalid => e
      render_json_error(e.record.errors.full_messages.join(", "), status: 422)
    end

    def destroy
      params.require(:id)

      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])
      
      # Only admins or the feedback creator can delete
      unless current_user.admin? || current_user.moderator? || feedback.user_id == current_user.id
        return render_json_error("You don't have permission to delete this feedback", status: 403)
      end

      feedback.update!(deleted_at: Time.current)

      render_serialized(feedback, UserFeedbackSerializer)
    end

    def index
      raise Discourse::InvalidParameters.new(:feedback_to_id) if params.has_key?(:feedback_to_id) && params[:feedback_to_id].to_i <= 0

      page = params[:page].to_i || 1

      feedbacks = DiscourseUserFeedbacks::UserFeedback.includes(:user, :feedback_to, :admin_modified_by)
                                                       .order(created_at: :desc)

      feedbacks = feedbacks.where(feedback_to_id: params[:feedback_to_id]) if params[:feedback_to_id]

      # Users can see their own given feedbacks and received feedbacks
      unless current_user.admin? || current_user.moderator?
        feedbacks = feedbacks.where(
          "user_id = ? OR feedback_to_id = ?", 
          current_user.id, 
          current_user.id
        )
      end

      count = feedbacks.count

      feedbacks = feedbacks.offset(page * PAGE_SIZE).limit(PAGE_SIZE)

      render_json_dump({ 
        count: count, 
        feedbacks: serialize_data(feedbacks, UserFeedbackSerializer),
        can_modify: current_user.admin? || current_user.moderator?
      })
    end

    def show
      params.require(:id)

      feedback = DiscourseUserFeedbacks::UserFeedback.find(params[:id])

      # Users can only see feedbacks they gave or received
      unless current_user.admin? || current_user.moderator? || 
             feedback.user_id == current_user.id || 
             feedback.feedback_to_id == current_user.id
        return render_json_error("You don't have permission to view this feedback", status: 403)
      end

      render_serialized(feedback, UserFeedbackSerializer)
    end

    def stats
      # Admin-only endpoint for statistics
      unless current_user.admin?
        return render_json_error("Only administrators can view statistics", status: 403)
      end

      daily_stats = daily_statistics
      weekly_stats = weekly_statistics

      render_json_dump({
        daily: daily_stats,
        weekly: weekly_stats
      })
    end

    private

    def daily_statistics
      today = Date.current
      {
        date: today,
        total_feedbacks: DiscourseUserFeedbacks::UserFeedback.today.count,
        positive: DiscourseUserFeedbacks::UserFeedback.today.positive.count,
        neutral: DiscourseUserFeedbacks::UserFeedback.today.neutral.count,
        negative: DiscourseUserFeedbacks::UserFeedback.today.negative.count,
        unique_raters: DiscourseUserFeedbacks::UserFeedback.today.distinct.count(:user_id),
        unique_rated: DiscourseUserFeedbacks::UserFeedback.today.distinct.count(:feedback_to_id)
      }
    end

    def weekly_statistics
      week_start = Date.current.beginning_of_week
      week_end = Date.current.end_of_week
      
      {
        week_start: week_start,
        week_end: week_end,
        total_feedbacks: DiscourseUserFeedbacks::UserFeedback.this_week.count,
        positive: DiscourseUserFeedbacks::UserFeedback.this_week.positive.count,
        neutral: DiscourseUserFeedbacks::UserFeedback.this_week.neutral.count,
        negative: DiscourseUserFeedbacks::UserFeedback.this_week.negative.count,
        unique_raters: DiscourseUserFeedbacks::UserFeedback.this_week.distinct.count(:user_id),
        unique_rated: DiscourseUserFeedbacks::UserFeedback.this_week.distinct.count(:feedback_to_id),
        daily_breakdown: daily_breakdown_for_week
      }
    end

    def daily_breakdown_for_week
      week_start = Date.current.beginning_of_week
      (0..6).map do |day_offset|
        date = week_start + day_offset.days
        day_feedbacks = DiscourseUserFeedbacks::UserFeedback.where(
          created_at: date.beginning_of_day..date.end_of_day
        )
        
        {
          date: date,
          total: day_feedbacks.count,
          positive: day_feedbacks.positive.count,
          neutral: day_feedbacks.neutral.count,
          negative: day_feedbacks.negative.count
        }
      end
    end
  end
end
