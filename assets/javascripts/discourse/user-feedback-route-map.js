export default {
  resource: "user",
  map() {
    this.route("feedbacks", { path: "/feedbacks" });
  },
};
