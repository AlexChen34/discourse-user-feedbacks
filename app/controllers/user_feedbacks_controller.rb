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

    def user_feedbacks_total
      ensure_admin
      
      start_date = params[:start_date]&.to_date || 30.days.ago
      end_date = params[:end_date]&.to_date || Date.current
      
      data = []
      current_date = start_date
      
      while current_date <= end_date
        count = DiscourseUserFeedbacks::UserFeedback.where(created_at: current_date.beginning_of_day..current_date.end_of_day).count
        data << { x: current_date.strftime('%Y-%m-%d'), y: count }
        current_date += 1.day
      end
      
      report = {
        type: 'user_feedbacks_total',
        title: 'Total User Feedbacks',
        data: data,
        total: DiscourseUserFeedbacks::UserFeedback.where(created_at: start_date.beginning_of_day..end_date.end_of_day).count,
        start_date: start_date,
        end_date: end_date
      }
      
      render json: { report: report }
    end

    def user_feedbacks_by_rating
      ensure_admin
      
      start_date = params[:start_date]&.to_date || 30.days.ago
      end_date = params[:end_date]&.to_date || Date.current
      
      feedbacks_in_period = DiscourseUserFeedbacks::UserFeedback.where(created_at: start_date.beginning_of_day..end_date.end_of_day)
      
      positive_count = feedbacks_in_period.where(rating: 1).count
      neutral_count = feedbacks_in_period.where(rating: 0).count
      negative_count = feedbacks_in_period.where(rating: -1).count
      
      report = {
        type: 'user_feedbacks_by_rating',
        title: 'User Feedbacks by Rating',
        data: [
          { x: 'Positive', y: positive_count, color: '#46B54A' },
          { x: 'Neutral', y: neutral_count, color: '#F7941E' },
          { x: 'Negative', y: negative_count, color: '#D32F2F' }
        ],
        total: positive_count + neutral_count + negative_count,
        start_date: start_date,
        end_date: end_date
      }
      
      render json: { report: report }
    end

    def user_feedbacks_activity
      ensure_admin
      
      start_date = params[:start_date]&.to_date || 30.days.ago
      end_date = params[:end_date]&.to_date || Date.current
      
      data = []
      current_date = start_date
      
      while current_date <= end_date
        feedbacks_on_date = DiscourseUserFeedbacks::UserFeedback.where(created_at: current_date.beginning_of_day..current_date.end_of_day)
        
        positive_count = feedbacks_on_date.where(rating: 1).count
        neutral_count = feedbacks_on_date.where(rating: 0).count
        negative_count = feedbacks_on_date.where(rating: -1).count
        
        data << {
          x: current_date.strftime('%Y-%m-%d'),
          y: positive_count + neutral_count + negative_count,
          positive: positive_count,
          neutral: neutral_count,
          negative: negative_count
        }
        
        current_date += 1.day
      end
      
      report = {
        type: 'user_feedbacks_activity',
        title: 'User Feedback Activity',
        data: data,
        total: DiscourseUserFeedbacks::UserFeedback.where(created_at: start_date.beginning_of_day..end_date.end_of_day).count,
        start_date: start_date,
        end_date: end_date
      }
      
      render json: { report: report }
    end

    private

    def ensure_admin
      unless current_user.admin?
        render_json_error("Only administrators can access this endpoint", status: 403)
      end
    end

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
