import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";
import I18n from "I18n";
import { computed } from "@ember/object";

export default class UserFeedbacksController extends Controller {
  @tracked rating = 0;
  @tracked review = "";
  @tracked readOnly = false;
  
  placeholder = I18n.t(
    "discourse_user_feedbacks.user_feedbacks.user_review.placeholder"
  );

  @computed("feedback_to_id")
  get canGiveFeedback() {
    return this.feedback_to_id !== this.currentUser && this.currentUser.id;
  }

  @computed("rating")
  get disabled() {
    return !parseInt(this.rating) > 0;
  }

  @action
  createFeedback() {
    this.readOnly = true;
    ajax("/user_feedbacks", {
      type: "POST",
      data: {
        rating: parseInt(this.rating),
        review: this.review,
        feedback_to_id: this.feedback_to_id,
      },
    }).then((response) => {
      this.model.feedbacks.unshiftObject(response.user_feedback);
      this.rating = 0;
      this.review = "";
    });
  }
}
