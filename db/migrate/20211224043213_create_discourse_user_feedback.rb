# frozen_string_literal: true
class CreateDiscourseUserFeedback < ActiveRecord::Migration[7.0]
  def change
    create_table :user_feedbacks do |t|
      t.integer :user_id, null: false
      t.integer :feedback_to_id, null: false
      t.integer :rating, null: false
      t.text :review
      t.datetime :deleted_at
      t.timestamps
    end
    
    add_index :user_feedbacks, :user_id
    add_index :user_feedbacks, :feedback_to_id
    add_index :user_feedbacks, [:user_id, :feedback_to_id], unique: true
  end
end
