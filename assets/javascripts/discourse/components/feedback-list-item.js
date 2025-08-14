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
  
  // Simple rate limiting using timestamp
  lastRatingUpdate = 0;

  @action
  updateRating(newRating) {
    const now = Date.now();
    
    console.log('updateRating called with:', newRating, 'current editRating:', this.editRating);
    
    // Prevent duplicate selections and rate limit rapid clicks (300ms minimum)
    if (this.editRating === newRating) {
      console.log('Rating already set to', newRating, '- ignoring duplicate');
      return;
    }
    
    if (now - this.lastRatingUpdate < 300) {
      console.log('Rate limiting - ignoring rapid click');
      return;
    }
    
    console.log('Updating rating from', this.editRating, 'to', newRating);
    this.editRating = newRating;
    this.lastRatingUpdate = now;
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
    this.lastRatingUpdate = 0; // Reset rate limiting
  }

  @action
  cancelEdit() {
    this.isEditing = false;
    this.editRating = null;
    this.editReview = "";
    this.lastRatingUpdate = 0; // Reset rate limiting
  }

  @action
  saveEdit() {
    console.log('saveEdit called with rating:', this.editRating, 'review:', this.editReview);
    
    const data = {
      user_feedback: {
        rating: this.editRating,
        review: this.editReview
      }
    };

    // Capture the refresh callback before the async operation
    const refreshCallback = this.args?.onRefresh;
    const hasValidCallback = refreshCallback && typeof refreshCallback === 'function';
    
    console.log('Refresh callback available:', hasValidCallback);

    ajax(`/user_feedbacks/${this.args.feedback.id}`, {
      type: "PUT",
      data: data
    }).then((response) => {
      console.log('Save response:', response);
      
      // Update editing state first
      this.isEditing = false;
      
      // Call refresh callback or fallback to page reload
      if (hasValidCallback) {
        try {
          console.log('Calling refresh callback...');
          // Call the captured callback directly
          refreshCallback();
        } catch (error) {
          console.warn('Error calling refresh callback, falling back to page reload:', error);
          window.location.reload();
        }
      } else {
        // No valid callback, refresh the page
        console.log('No valid refresh callback available, refreshing page');
        window.location.reload();
      }
    }).catch(popupAjaxError);
  }

  @action
  deleteFeedback() {
    if (confirm("Are you sure you want to delete this feedback?")) {
      // Capture the refresh callback before the async operation
      const refreshCallback = this.args?.onRefresh;
      const hasValidCallback = refreshCallback && typeof refreshCallback === 'function';

      ajax(`/user_feedbacks/${this.args.feedback.id}`, {
        type: "DELETE"
      }).then((response) => {
        // Call refresh callback or fallback to page reload
        if (hasValidCallback) {
          try {
            // Call the captured callback directly
            refreshCallback();
          } catch (error) {
            console.warn('Error calling refresh callback, falling back to page reload:', error);
            window.location.reload();
          }
        } else {
          // No valid callback, refresh the page
          console.log('No valid refresh callback available, refreshing page');
          window.location.reload();
        }
      }).catch(popupAjaxError);
    }
  }
}
