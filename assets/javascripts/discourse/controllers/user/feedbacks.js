import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";
import I18n from "I18n";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";

export default class UserFeedbacksController extends Controller {
  @service siteSettings;
  @service appEvents;
  
  @tracked rating = 0;
  @tracked review = "";
  @tracked readOnly = false;
  @tracked target_username = "";
  
  placeholder = I18n.t(
    "discourse_user_feedbacks.user_feedbacks.user_review.placeholder"
  );

  @computed("feedback_to_id", "currentUser.id")
  get canGiveFeedback() {
    return this.feedback_to_id && 
           this.feedback_to_id !== this.currentUser?.id && 
           this.currentUser?.id;
  }

  @computed("rating")
  get disabled() {
    return !parseInt(this.rating) > 0;
  }

  @action
  updateRating(value) {
    this.rating = value;
  }

  @action
  createFeedback() {
    if (!this.canGiveFeedback || this.disabled) return;
    
    this.readOnly = true;
    ajax("/user_feedbacks", {
      type: "POST",
      data: {
        user_feedback: {
          rating: parseInt(this.rating),
          review: this.review,
          feedback_to_id: this.feedback_to_id,
        }
      },
    }).then((response) => {
      // Add the new feedback to the model
      if (response.user_feedback) {
        if (!this.model.feedbacks) {
          this.model.feedbacks = [];
        }
        this.model.feedbacks.unshiftObject(response.user_feedback);
        this.model.count = (this.model.count || 0) + 1;
      }
      
      // Reset form
      this.rating = 0;
      this.review = "";
      this.readOnly = true; // User can only give one feedback
      
      // Show success message
      this.appEvents.trigger("modal-body:flash", {
        text: I18n.t("discourse_user_feedbacks.user_feedbacks.feedback_created"),
        messageClass: "success"
      });
    }).catch((error) => {
      this.readOnly = false;
      console.error("Error creating feedback:", error);
      
      // Show error message
      this.appEvents.trigger("modal-body:flash", {
        text: I18n.t("discourse_user_feedbacks.user_feedbacks.feedback_error"),
        messageClass: "error"
      });
    });
  }
}
