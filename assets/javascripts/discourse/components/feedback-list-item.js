import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import I18n from "I18n";

export default class FeedbackListItem extends Component {
  @service currentUser;

  @tracked isEditing = false;
  @tracked editRating = null;
  @tracked editReview = "";

  @action
  updateRating(newRating) {
    this.editRating = newRating;
  }

  @action
  updateReview(event) {
    this.editReview = event.target.value;
  }

  @action
  startEdit() {
    this.isEditing = true;
    this.editRating = this.args.feedback.rating;
    this.editReview = this.args.feedback.review || "";
  }

  @action
  cancelEdit() {
    this.isEditing = false;
    this.editRating = null;
    this.editReview = "";
  }

  @action
  saveEdit() {
    const data = {
      user_feedback: {
        rating: this.editRating,
        review: this.editReview
      }
    };

    ajax(`/user_feedbacks/${this.args.feedback.id}`, {
      type: "PUT",
      data: data
    }).then((response) => {
      // Update the feedback object with new values
      this.args.feedback.rating = this.editRating;
      this.args.feedback.review = this.editReview;
      this.args.feedback.admin_modified = true;
      this.args.feedback.admin_modified_at = new Date().toISOString();
      this.args.feedback.admin_modified_by = this.currentUser;
      
      this.isEditing = false;
      
      // Call refresh callback if provided
      if (this.args.onRefresh && typeof this.args.onRefresh === 'function') {
        this.args.onRefresh();
      }
    }).catch(popupAjaxError);
  }

  @action
  deleteFeedback() {
    if (confirm(I18n.t("discourse_user_feedbacks.confirm_delete"))) {
      ajax(`/user_feedbacks/${this.args.feedback.id}`, {
        type: "DELETE"
      }).then(() => {
        // Call refresh callback if provided
        if (this.args.onRefresh && typeof this.args.onRefresh === 'function') {
          this.args.onRefresh();
        }
      }).catch(popupAjaxError);
    }
  }
}
