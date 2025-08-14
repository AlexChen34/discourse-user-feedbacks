import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

function initializeDiscourseUserFeedbacks(api) {
  const site = api.container.lookup("site:main");
  const siteSettings = api.container.lookup("site-settings:main");

  api.includePostAttributes(
    "user_average_rating", 
    "user_rating_count", 
    "user_positive_count", 
    "user_neutral_count", 
    "user_negative_count"
  );

  if (
    !site.mobileView &&
    siteSettings.user_feedbacks_display_average_ratings_beside_username_on_post
  ) {
    api.decorateWidget("poster-name:after", (helper) => {
      const positiveCount = helper.attrs.user_positive_count || 0;
      const neutralCount = helper.attrs.user_neutral_count || 0;
      const negativeCount = helper.attrs.user_negative_count || 0;
      const totalCount = positiveCount + neutralCount + negativeCount;
      
      if (helper.attrs.user_id <= 0 || totalCount === 0) {
        return;
      }
      
      return helper.h("div.average-ratings", [
        helper.h("div.rating-summary", [
          helper.h("span.positive-count", `+${positiveCount}`),
          helper.h("span.neutral-count", `=${neutralCount}`),
          helper.h("span.negative-count", `-${negativeCount}`)
        ]),
        helper.h(
          "span.rating-count",
          helper.h(
            "a",
            { href: `${helper.attrs.usernameUrl}/feedbacks` },
            I18n.t(
              "discourse_user_feedbacks.user_feedbacks.user_ratings_count",
              { count: totalCount }
            )
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
      withPluginApi("1.0.0", initializeDiscourseUserFeedbacks);
    }
  },
};
