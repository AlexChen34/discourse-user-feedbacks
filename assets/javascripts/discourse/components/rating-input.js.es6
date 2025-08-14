import Component from "@ember/component";
import { action } from "@ember/object";
import { computed } from "@ember/object";

export default Component.extend({
  classNames: ["user-ratings"],
  value: 0, // -1 = negative, 0 = neutral, 1 = positive

  didReceiveAttrs() {
    this._super(...arguments);
  },

  actions: {
    changeRating(value) {
      if (this.readOnly) return;
      this.set("value", value);
    }
  },

  isPositive: computed("value", function() {
    return this.value === 1;
  }),

  isNeutral: computed("value", function() {
    return this.value === 0;
  }),

  isNegative: computed("value", function() {
    return this.value === -1;
  }),

  ratingText: computed("value", function() {
    switch(this.value) {
      case 1: return "Positive";
      case 0: return "Neutral";
      case -1: return "Negative";
      default: return "Not rated";
    }
  })
});
