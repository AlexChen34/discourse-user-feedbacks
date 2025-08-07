import { withPluginApi } from "discourse/lib/plugin-api";

function initializeDiscourseUserFeedbacks(api) {
  const site = api.container.lookup("service:site");
  const siteSettings = api.container.lookup("service:site-settings");

  api.includePostAttributes("user_average_rating", "user_rating_count");

  if (
    !site.mobileView &&
    siteSettings.user_feedbacks_display_average_ratings_beside_username_on_post
  ) {
    api.decorateWidget("poster-name", (helper) => {
      const value = helper.attrs.user_average_rating;
      if (helper.attrs.user_id <= 0 || !value) {
        return;
      }
      
      return helper.h("div.average-ratings", [
        helper.h("div.rating-display", [
          helper.h("span.stars", 
            Array.from({length: 5}, (_, i) => {
              const starValue = i + 1;
              let starClass = "star";
              
              if (value >= starValue) {
                starClass += " filled";
              } else if (value > i && value < starValue) {
                starClass += " partial";
              }
              
              return helper.h(`span.${starClass}`, "★");
            })
          ),
          helper.h("span.rating-value", ` ${value.toFixed(1)}`),
        ]),
        helper.h(
          "span.rating-count",
          helper.h(
            "a",
            { href: `${helper.attrs.usernameUrl}/feedbacks` },
            `(${helper.attrs.user_rating_count})`
          )
        ),
      ]);
    });
  }
}

export default {
  name: "discourse-user-feedbacks",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");

    if (siteSettings.user_feedbacks_enabled) {
      withPluginApi("1.8.0", initializeDiscourseUserFeedbacks);
    }
  },
};
