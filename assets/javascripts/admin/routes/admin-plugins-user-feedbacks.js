import DiscourseRoute from "discourse/routes/discourse";
import { ajax } from "discourse/lib/ajax";

export default class AdminPluginsUserFeedbacksRoute extends DiscourseRoute {
  async model() {
    try {
      const response = await ajax("/admin/user_feedbacks.json");
      return response;
    } catch (error) {
      console.error("Error loading user feedbacks:", error);
      return { feedbacks: [], total_pages: 0 };
    }
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties({
      feedbacks: model.feedbacks || [],
      totalPages: model.total_pages || 0,
      page: 1
    });
    
    // Load stats
    controller.loadStats();
  }
}
