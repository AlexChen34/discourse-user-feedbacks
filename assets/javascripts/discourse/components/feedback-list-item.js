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
    console.log('Updating rating from', this.editRating, 'to', newRating);
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
      if (this.currentUser) {
        this.args.feedback.admin_modified_by = this.currentUser;
      }
      
      this.isEditing = false;
      
      // Force a component re-render to update the UI
      this.args.feedback = {...this.args.feedback};
      
      // Call refresh callback if provided and it's a function
      if (this.args.onRefresh) {
        if (typeof this.args.onRefresh === 'function') {
          try {
            this.args.onRefresh.call(this);
          } catch (error) {
            console.warn('Error calling onRefresh callback:', error);
            // Try calling without context
            try {
              this.args.onRefresh();
            } catch (error2) {
              console.warn('Error calling onRefresh callback (no context):', error2);
            }
          }
        } else {
          console.warn('onRefresh is not a function:', typeof this.args.onRefresh);
        }
      }
    }).catch(popupAjaxError);
  }

  @action
  deleteFeedback() {
    if (confirm("Are you sure you want to delete this feedback?")) {
      ajax(`/user_feedbacks/${this.args.feedback.id}`, {
        type: "DELETE"
      }).then((response) => {
        // Force refresh the page or reload the feedback list
        if (this.args.onRefresh) {
          if (typeof this.args.onRefresh === 'function') {
            try {
              this.args.onRefresh.call(this);
            } catch (error) {
              console.warn('Error calling onRefresh callback:', error);
              // Try calling without context
              try {
                this.args.onRefresh();
              } catch (error2) {
                console.warn('Error calling onRefresh callback (no context):', error2);
                // Fallback: refresh the page
                window.location.reload();
              }
            }
          } else {
            console.warn('onRefresh is not a function:', typeof this.args.onRefresh);
            window.location.reload();
          }
        } else {
          // No callback provided, refresh the page
          window.location.reload();
        }
      }).catch(popupAjaxError);
    }
  }
}
