import DiscourseRoute from "discourse/routes/discourse";
import { ajax } from "discourse/lib/ajax";

export default DiscourseRoute.extend({
  model() {
    return ajax("/user_feedbacks.json", {
      type: "GET",
      data: {
        feedback_to_id: this.modelFor("user").id,
      },
    }).then((response) => {
      return response;
    });
  },

  setupController(controller, model) {
    const user = this.modelFor("user");
    controller.setProperties({
      feedback_to_id: user.id,
      readOnly:
        this.currentUser &&
        this.currentUser.feedbacks_to?.includes(user.id),
      model: model,
    });
  },
});
