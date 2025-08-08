import DiscourseRoute from "discourse/routes/discourse";
import { ajax } from "discourse/lib/ajax";

export default class UserFeedbacksRoute extends DiscourseRoute {
  async model() {
    const user = this.modelFor("user");
    const username = user.get("username");
    
    try {
      const response = await ajax(`/u/${username}/feedbacks.json`, {
        type: "GET",
      });
      return response;
    } catch (error) {
      // Fallback to old API if new route doesn't work
      const response = await ajax("/user_feedbacks.json", {
        type: "GET",
        data: {
          feedback_to_id: user.get("id"),
        },
      });
      return response;
    }
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    
    const user = this.modelFor("user");
    controller.setProperties({
      feedback_to_id: user.get("id"),
      target_username: user.get("username"),
      readOnly:
        this.currentUser &&
        this.currentUser.feedbacks_to &&
        this.currentUser.feedbacks_to.includes(user.get("id")),
      model: model,
    });
  }
}
