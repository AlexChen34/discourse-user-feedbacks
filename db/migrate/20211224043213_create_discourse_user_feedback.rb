# frozen_string_literal: true
class CreateDiscourseUserFeedback < ActiveRecord::Migration[6.1]
  def change
    return if table_exists?(:user_feedbacks)
    
    create_table :user_feedbacks do |t|
      t.integer :user_id, null: false
      t.integer :feedback_to_id, null: false
      t.integer :rating, null: false
      t.text :review
      t.datetime :deleted_at
      t.timestamps
    end
    
    add_index :user_feedbacks, :user_id unless index_exists?(:user_feedbacks, :user_id)
    add_index :user_feedbacks, :feedback_to_id unless index_exists?(:user_feedbacks, :feedback_to_id)
    add_index :user_feedbacks, [:user_id, :feedback_to_id], unique: true unless index_exists?(:user_feedbacks, [:user_id, :feedback_to_id])
  end
end
