import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";
import I18n from "I18n";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";

export default class UserFeedbacksController extends Controller {
  @service siteSettings;
  
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
      this.model.feedbacks.unshiftObject(response.user_feedback);
      this.rating = 0;
      this.review = "";
      this.readOnly = false;
    }).catch((error) => {
      this.readOnly = false;
      // Handle error appropriately
      console.error("Error creating feedback:", error);
    });
  }
}
