import Component from "@ember/component";
import { computed } from "@ember/object";

export default Component.extend({
  classNames: ["user-ratings"],
  value: 0,

  checkedOne: computed("value", function() {
    return parseInt(this.value || 0) >= 1;
  }),

  checkedTwo: computed("value", function() {
    return parseInt(this.value || 0) >= 2;
  }),

  checkedThree: computed("value", function() {
    return parseInt(this.value || 0) >= 3;
  }),

  checkedFour: computed("value", function() {
    return parseInt(this.value || 0) >= 4;
  }),

  checkedFive: computed("value", function() {
    return parseInt(this.value || 0) >= 5;
  }),

  percentageOne: computed("value", function() {
    const val = parseFloat(this.value || 0);
    if (val > 0 && val < 1) {
      return (val % 1) * 100;
    }
    return 0;
  }),

  percentageTwo: computed("value", function() {
    const val = parseFloat(this.value || 0);
    if (val > 1 && val < 2) {
      return (val % 1) * 100;
    }
    return 0;
  }),

  percentageThree: computed("value", function() {
    const val = parseFloat(this.value || 0);
    if (val > 2 && val < 3) {
      return (val % 1) * 100;
    }
    return 0;
  }),

  percentageFour: computed("value", function() {
    const val = parseFloat(this.value || 0);
    if (val > 3 && val < 4) {
      return (val % 1) * 100;
    }
    return 0;
  }),

  percentageFive: computed("value", function() {
    const val = parseFloat(this.value || 0);
    if (val > 4 && val < 5) {
      return (val % 1) * 100;
    }
    return 0;
  }),

  actions: {
    changeRating(value) {
      if (this.readOnly) return;
      if (value && value > 0) {
        this.set("value", value);
      }
    }
  }
});
