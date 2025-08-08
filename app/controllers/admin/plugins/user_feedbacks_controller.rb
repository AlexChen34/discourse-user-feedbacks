# frozen_string_literal: true

class Admin::Plugins::UserFeedbacksController < Admin::AdminController
  def index
    redirect_to "/admin/plugins/user-feedbacks"
  end
end
