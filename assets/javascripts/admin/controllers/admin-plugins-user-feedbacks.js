import Controller from "@ember/controller";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import I18n from "I18n";

export default class AdminPluginsUserFeedbacksController extends Controller {
  @service dialog;
  
  @tracked feedbacks = [];
  @tracked loading = false;
  @tracked page = 1;
  @tracked totalPages = 1;
  @tracked search = "";
  @tracked selectedFeedback = null;
  @tracked editingFeedback = null;
  @tracked stats = null;

  // Load data when controller is set up
  setupController(controller, model) {
    super.setupController(...arguments);
    this.feedbacks = model.feedbacks || [];
    this.loadStats();
  }

  @action
  async loadFeedbacks() {
    this.loading = true;
    try {
      const response = await ajax("/admin/user_feedbacks.json", {
        data: {
          page: this.page,
          search: this.search
        }
      });
      
      this.feedbacks = response.feedbacks;
      this.totalPages = response.total_pages;
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      this.loading = false;
    }
  }

  @action
  async loadStats() {
    try {
      const stats = await ajax("/admin/user_feedbacks/stats.json");
      this.stats = stats;
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  @action
  searchFeedbacks() {
    this.page = 1;
    this.loadFeedbacks();
  }

  @action
  editFeedback(feedback) {
    this.editingFeedback = {
      id: feedback.id,
      rating: feedback.rating,
      review: feedback.review
    };
  }

  @action
  async saveFeedback() {
    try {
      await ajax(`/admin/user_feedbacks/${this.editingFeedback.id}.json`, {
        type: "PUT",
        data: {
          user_feedback: {
            rating: this.editingFeedback.rating,
            review: this.editingFeedback.review
          }
        }
      });

      if (this.dialog && this.dialog.alert) {
        this.dialog.alert(I18n.t("discourse_user_feedbacks.admin.feedback_updated"));
      }

      this.editingFeedback = null;
      this.loadFeedbacks();
    } catch (error) {
      console.error("Error updating feedback:", error);
      if (this.dialog && this.dialog.alert) {
        this.dialog.alert(I18n.t("discourse_user_feedbacks.admin.update_error"));
      }
    }
  }

  @action
  async deleteFeedback(feedback) {
    let confirmResult = true;
    
    if (this.dialog && this.dialog.confirm) {
      confirmResult = await this.dialog.confirm(
        I18n.t("discourse_user_feedbacks.admin.confirm_delete")
      );
    } else {
      confirmResult = confirm(I18n.t("discourse_user_feedbacks.admin.confirm_delete"));
    }
    
    if (!confirmResult) return;

    try {
      await ajax(`/admin/user_feedbacks/${feedback.id}.json`, {
        type: "DELETE"
      });

      if (this.dialog && this.dialog.alert) {
        this.dialog.alert(I18n.t("discourse_user_feedbacks.admin.feedback_deleted"));
      }

      this.loadFeedbacks();
      this.loadStats();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      if (this.dialog && this.dialog.alert) {
        this.dialog.alert(I18n.t("discourse_user_feedbacks.admin.delete_error"));
      }
    }
  }

  @action
  cancelEdit() {
    this.editingFeedback = null;
  }

  @action
  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadFeedbacks();
    }
  }

  @action
  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadFeedbacks();
    }
  }
}
