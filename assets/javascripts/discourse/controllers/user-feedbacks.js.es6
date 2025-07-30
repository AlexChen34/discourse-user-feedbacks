import Controller from "@ember/controller";
import { action, computed } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import I18n from "I18n";

export default Controller.extend({
  rating: 0,
  review: "",
  readOnly: false,
  placeholder: I18n.t(
    "discourse_user_feedbacks.user_feedbacks.user_review.placeholder"
  ),

  canGiveFeedback: computed("feedback_to_id", function() {
    return this.feedback_to_id !== this.currentUser && this.currentUser.id;
  }),

  disabled: computed("rating", function() {
    return !parseInt(this.rating) > 0;
  }),

  actions: {
    createFeedback() {
      this.set("readOnly", true);
      ajax("/user_feedbacks", {
        type: "POST",
        data: {
          rating: parseInt(this.rating),
          review: this.review,
          feedback_to_id: this.feedback_to_id,
        },
      }).then((response) => {
        this.model?.feedbacks?.unshiftObject(response.user_feedback);
        this.set("rating", 0);
        this.set("review", "");
      });
    }
  }
});
