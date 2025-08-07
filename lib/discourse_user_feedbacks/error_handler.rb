# frozen_string_literal: true

module DiscourseUserFeedbacks
  module ErrorHandler
    extend ActiveSupport::Concern

    private

    def handle_feedback_error(error)
      case error
      when ActiveRecord::RecordInvalid
        render_json_error(error.record.errors.full_messages.join(", "), status: 422)
      when ActiveRecord::RecordNotFound
        render_json_error(I18n.t("not_found"), status: 404)
      when Discourse::InvalidParameters
        render_json_error(I18n.t("invalid_params", param: error.message), status: 400)
      else
        Rails.logger.error "UserFeedback Error: #{error.message}"
        Rails.logger.error error.backtrace.join("\n")
        render_json_error(I18n.t("generic_error"), status: 500)
      end
    end
  end
end
