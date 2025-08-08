# frozen_string_literal: true

module DiscourseUserFeedbacks
  class UserFeedback < ActiveRecord::Base
    self.table_name = 'user_feedbacks'

    belongs_to :user
    belongs_to :feedback_to, class_name: 'User'

    validates :rating, presence: true, inclusion: { in: 1..5 }
    validates :user_id, presence: true
    validates :feedback_to_id, presence: true
    validates :review, length: { maximum: 1000 }
    
    validate :cannot_feedback_self
    validate :unique_feedback_per_user

    default_scope { where(deleted_at: nil) }

    scope :for_user, ->(user_id) { where(feedback_to_id: user_id) }
    scope :by_user, ->(user_id) { where(user_id: user_id) }

    def soft_delete!
      update!(deleted_at: Time.current)
    end

    private

    def cannot_feedback_self
      errors.add(:feedback_to_id, "Cannot give feedback to yourself") if user_id == feedback_to_id
    end

    def unique_feedback_per_user
      existing = self.class.where(user_id: user_id, feedback_to_id: feedback_to_id)
      existing = existing.where.not(id: id) if persisted?
      
      if existing.exists?
        errors.add(:base, "You have already given feedback to this user")
      end
    end
  end
end
