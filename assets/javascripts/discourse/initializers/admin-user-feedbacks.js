import { withPluginApi } from "discourse/lib/plugin-api";

function initializeAdminUserFeedbacks(api) {
  api.addAdminSidebarSection((AdminSidebarSection, BaseCustomSidebarSection) => {
    return class UserFeedbacksAdminSidebarSection extends BaseCustomSidebarSection {
      get name() {
        return "user-feedbacks-admin";
      }

      get title() {
        return "User Feedbacks";
      }

      get text() {
        return "User Feedbacks";
      }

      get actionsIcon() {
        return "star";
      }

      get actions() {
        return [
          {
            id: "admin-user-feedbacks",
            name: "Manage Feedbacks",
            title: "Manage User Feedbacks",
            text: "Manage Feedbacks",
            icon: "cog",
            href: "/admin/plugins/user-feedbacks"
          }
        ];
      }
    };
  });
}

export default {
  name: "admin-user-feedbacks",
  initialize() {
    withPluginApi("0.11.0", initializeAdminUserFeedbacks);
  }
};
