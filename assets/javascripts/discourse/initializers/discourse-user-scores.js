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
      // Use modern post decoration API instead of deprecated widget
      if (api.decorateCooked) {
        api.decorateCooked((element, helper) => {
          try {
            const postStream = helper?.getModel?.()?.postStream;
            if (!postStream) return;

            const posterNames = element.querySelectorAll('.names .first a, .names a');
            posterNames.forEach(nameEl => {
              const username = nameEl.textContent?.trim();
              if (!username) return;

              const post = postStream.posts?.find(p => p.username === username);
              if (!post) return;

              const value = post.user_average_rating;
              const count = post.user_rating_count;
              
              if (!value || value <= 0 || !count) return;

              // Check if rating already added
              if (nameEl.querySelector('.average-ratings-inline')) return;

              const ratingEl = document.createElement("span");
              ratingEl.className = "average-ratings-inline";
              
              const starsEl = document.createElement("span");
              starsEl.className = "stars-inline";
              
              // Create stars
              for (let i = 1; i <= 5; i++) {
                const star = document.createElement("span");
                star.className = "star-inline";
                star.textContent = "★";
                
                if (value >= i) {
                  star.classList.add("filled");
                } else if (value > i - 1) {
                  star.classList.add("partial");
                }
                
                starsEl.appendChild(star);
              }
              
              const ratingValueEl = document.createElement("span");
              ratingValueEl.className = "rating-value-inline";
              ratingValueEl.textContent = ` ${value.toFixed(1)}`;
              
              const countEl = document.createElement("span");
              countEl.className = "rating-count-inline";
              countEl.innerHTML = ` <a href="/u/${username}/feedbacks">(${count})</a>`;
              
              ratingEl.appendChild(starsEl);
              ratingEl.appendChild(ratingValueEl);
              ratingEl.appendChild(countEl);
              
              nameEl.appendChild(ratingEl);
            });
          } catch (error) {
            console.error("Error decorating cooked content:", error);
          }
        });
      }
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
