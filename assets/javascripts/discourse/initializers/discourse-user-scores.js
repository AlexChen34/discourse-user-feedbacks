import { withPluginApi } from "discourse/lib/plugin-api";

function initializeDiscourseUserFeedbacks(api) {
  try {
    // Support for both old and new API versions
    if (api.addTrackedPostProperties) {
      api.addTrackedPostProperties("user_average_rating", "user_rating_count");
    } else if (api.includePostAttributes) {
      api.includePostAttributes("user_average_rating", "user_rating_count");
    }

    const site = api.container.lookup("service:site");
    const siteSettings = api.container.lookup("service:site-settings");

    if (
      !site?.mobileView &&
      siteSettings?.user_feedbacks_display_average_ratings_beside_username_on_post
    ) {
      // Use widget decoration which is more stable
      api.decorateWidget("poster-name", (helper) => {
        try {
          const post = helper.getModel ? helper.getModel() : helper.attrs;
          const value = post?.user_average_rating;
          const count = post?.user_rating_count;
          
          if (!value || value <= 0 || !count) {
            return;
          }

          return helper.h("div.average-ratings-inline", [
            helper.h("span.stars-inline", 
              Array.from({length: 5}, (_, i) => {
                const starValue = i + 1;
                let starClass = "star-inline";
                
                if (value >= starValue) {
                  starClass += " filled";
                } else if (value > i && value < starValue) {
                  starClass += " partial";
                }
                
                return helper.h(`span.${starClass}`, "★");
              })
            ),
            helper.h("span.rating-value-inline", ` ${value.toFixed(1)}`),
            helper.h("span.rating-count-inline", 
              helper.h("a", { 
                href: `/u/${post.username}/feedbacks` 
              }, `(${count})`)
            )
          ]);
        } catch (error) {
          console.error("Error decorating poster name:", error);
          return null;
        }
      });
    }
  } catch (error) {
    console.error("Error in initializeDiscourseUserFeedbacks:", error);
  }
}

export default {
  name: "discourse-user-feedbacks",

  initialize(container) {
    try {
      const siteSettings = container.lookup("service:site-settings");

      if (siteSettings?.user_feedbacks_enabled) {
        withPluginApi("0.8.31", initializeDiscourseUserFeedbacks);
      }
    } catch (error) {
      console.error("Error initializing discourse-user-feedbacks plugin:", error);
    }
  },
};
