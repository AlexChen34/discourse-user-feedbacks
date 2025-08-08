import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "user-feedbacks-admin-menu",
  
  initialize() {
    withPluginApi("0.8.31", (api) => {
      // Try to add admin menu link if API supports it
      if (api.addAdminSidebarSectionLink) {
        try {
          api.addAdminSidebarSectionLink("community", {
            name: "user_feedbacks",
            label: "User Feedbacks",
            icon: "star",
            href: "/admin/plugins/user-feedbacks"
          });
        } catch (e) {
          console.log("Could not add admin sidebar link:", e);
        }
      }
    });
  }
};
