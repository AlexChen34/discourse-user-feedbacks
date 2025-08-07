import { withPluginApi } from "discourse/lib/plugin-api";

function initializeDiscourseUserFeedbacks(api) {
  const site = api.container.lookup("service:site");
  const siteSettings = api.container.lookup("service:site-settings");

  api.includePostAttributes("user_average_rating", "user_rating_count");

  if (
    !site.mobileView &&
    siteSettings.user_feedbacks_display_average_ratings_beside_username_on_post
  ) {
    // Use modern post-stream decoration instead of deprecated widget
    api.decoratePostUsername((el, helper) => {
      const post = helper.getModel();
      const value = post.user_average_rating;
      const count = post.user_rating_count;
      
      if (!value || value <= 0 || !count) {
        return;
      }

      const ratingEl = document.createElement("div");
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
          star.style.background = `linear-gradient(90deg, var(--quaternary) ${((value - (i - 1)) * 100)}%, var(--primary-low-mid) ${((value - (i - 1)) * 100)}%)`;
          star.style.webkitBackgroundClip = "text";
          star.style.webkitTextFillColor = "transparent";
          star.style.backgroundClip = "text";
        }
        
        starsEl.appendChild(star);
      }
      
      const ratingValueEl = document.createElement("span");
      ratingValueEl.className = "rating-value-inline";
      ratingValueEl.textContent = ` ${value.toFixed(1)}`;
      
      const countEl = document.createElement("span");
      countEl.className = "rating-count-inline";
      countEl.innerHTML = ` <a href="/u/${post.username}/feedbacks">(${count})</a>`;
      
      ratingEl.appendChild(starsEl);
      ratingEl.appendChild(ratingValueEl);
      ratingEl.appendChild(countEl);
      
      el.appendChild(ratingEl);
    });
  }
}

export default {
  name: "discourse-user-feedbacks",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");

    if (siteSettings.user_feedbacks_enabled) {
      withPluginApi("1.8.0", initializeDiscourseUserFeedbacks);
    }
  },
};
