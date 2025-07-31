import DiscourseRoute from "discourse/routes/discourse";
import { ajax } from "discourse/lib/ajax";

export default DiscourseRoute.extend({
  model() {
    const user = this.modelFor("user");
    return ajax("/user_feedbacks.json", {
      type: "GET",
      data: {
        feedback_to_id: user.get ? user.get("id") : user.id,
      },
    }).then((response) => {
      return response;
    });
  },

  setupController(controller, model) {
    const user = this.modelFor("user");
    const userId = user.get ? user.get("id") : user.id;
    const currentUser = this.get("currentUser");
    
    controller.setProperties({
      feedback_to_id: userId,
      readOnly: currentUser && 
                currentUser.get("feedbacks_to") && 
                currentUser.get("feedbacks_to").includes(userId),
      model: model,
    });
  },
});
