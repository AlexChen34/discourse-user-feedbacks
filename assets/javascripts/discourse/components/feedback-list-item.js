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
      // Don't modify the args.feedback object directly - it might be read-only
      // Instead, just update our editing state and let the parent component handle the refresh
      
      this.isEditing = false;
      
      // Call refresh callback if provided to reload the data from server
      if (this.args?.onRefresh && typeof this.args.onRefresh === 'function') {
        try {
          // Use setTimeout to defer the callback execution and avoid context issues
          setTimeout(() => {
            if (this.args?.onRefresh && typeof this.args.onRefresh === 'function') {
              this.args.onRefresh();
            } else {
              console.log('onRefresh callback became unavailable, refreshing page');
              window.location.reload();
            }
          }, 10);
        } catch (error) {
          console.warn('Error with onRefresh callback, falling back to page reload:', error);
          window.location.reload();
        }
      } else {
        // No callback provided or not a function, refresh the page
        console.log('No valid onRefresh callback, refreshing page');
        window.location.reload();
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
        if (this.args?.onRefresh && typeof this.args.onRefresh === 'function') {
          try {
            // Use setTimeout to defer the callback execution and avoid context issues
            setTimeout(() => {
              if (this.args?.onRefresh && typeof this.args.onRefresh === 'function') {
                this.args.onRefresh();
              } else {
                console.log('onRefresh callback became unavailable, refreshing page');
                window.location.reload();
              }
            }, 10);
          } catch (error) {
            console.warn('Error with onRefresh callback, falling back to page reload:', error);
            window.location.reload();
          }
        } else {
          // No callback provided or not a function, refresh the page
          console.log('No valid onRefresh callback, refreshing page');
          window.location.reload();
        }
      }).catch(popupAjaxError);
    }
  }
}
