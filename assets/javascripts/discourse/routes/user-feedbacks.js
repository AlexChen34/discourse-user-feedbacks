import DiscourseRoute from "discourse/routes/discourse";
import { ajax } from "discourse/lib/ajax";

export default class UserFeedbacksRoute extends DiscourseRoute {
  async model() {
    const response = await ajax("/user_feedbacks.json", {
      type: "GET",
      data: {
        feedback_to_id: this.modelFor("user").get("id"),
      },
    });
    return response;
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    
    controller.setProperties({
      feedback_to_id: this.modelFor("user").get("id"),
      readOnly:
        this.currentUser &&
        this.currentUser.feedbacks_to.includes(this.modelFor("user").get("id")),
      model: model,
    });
  }
}
