# frozen_string_literal: true

require 'rails_helper'

module DiscourseUserFeedbacks
  RSpec.describe UserFeedback, type: :model do
    let(:user1) { Fabricate(:user) }
    let(:user2) { Fabricate(:user) }

    describe 'validations' do
      it 'validates presence of rating' do
        feedback = UserFeedback.new(user: user1, feedback_to: user2)
        expect(feedback).not_to be_valid
        expect(feedback.errors[:rating]).to include("can't be blank")
      end

      it 'validates rating is between 1 and 5' do
        feedback = UserFeedback.new(user: user1, feedback_to: user2, rating: 0)
        expect(feedback).not_to be_valid
        expect(feedback.errors[:rating]).to include("is not included in the list")

        feedback.rating = 6
        expect(feedback).not_to be_valid
        expect(feedback.errors[:rating]).to include("is not included in the list")

        feedback.rating = 3
        expect(feedback).to be_valid
      end

      it 'prevents self-feedback' do
        feedback = UserFeedback.new(user: user1, feedback_to: user1, rating: 5)
        expect(feedback).not_to be_valid
        expect(feedback.errors[:feedback_to_id]).to include("Cannot give feedback to yourself")
      end

      it 'prevents duplicate feedback from same user' do
        UserFeedback.create!(user: user1, feedback_to: user2, rating: 4)
        duplicate = UserFeedback.new(user: user1, feedback_to: user2, rating: 5)
        
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:base]).to include("You have already given feedback to this user")
      end
    end

    describe 'scopes' do
      let!(:feedback1) { UserFeedback.create!(user: user1, feedback_to: user2, rating: 4) }
      let!(:feedback2) { UserFeedback.create!(user: user2, feedback_to: user1, rating: 5) }

      it 'filters by feedback recipient' do
        expect(UserFeedback.for_user(user2.id)).to include(feedback1)
        expect(UserFeedback.for_user(user2.id)).not_to include(feedback2)
      end

      it 'filters by feedback giver' do
        expect(UserFeedback.by_user(user1.id)).to include(feedback1)
        expect(UserFeedback.by_user(user1.id)).not_to include(feedback2)
      end
    end

    describe 'soft delete' do
      let!(:feedback) { UserFeedback.create!(user: user1, feedback_to: user2, rating: 4) }

      it 'marks record as deleted without destroying it' do
        expect { feedback.soft_delete! }.not_to change { UserFeedback.unscoped.count }
        expect(feedback.reload.deleted_at).not_to be_nil
        expect(UserFeedback.all).not_to include(feedback)
      end
    end
  end
end
