import Component from "@ember/component";
import { action, computed } from "@ember/object";

export default Component.extend({
  classNames: ["user-ratings"],
  value: 0,

  didReceiveAttrs() {
    this._super(...arguments);
    // Initialize rating display when component receives attributes
    if (this.value !== undefined) {
      this.notifyPropertyChange('value');
    }
  },

  checkedOne: computed("value", function() {
    return parseInt(this.value) >= 1;
  }),

  checkedTwo: computed("value", function() {
    return parseInt(this.value) >= 2;
  }),

  checkedThree: computed("value", function() {
    return parseInt(this.value) >= 3;
  }),

  checkedFour: computed("value", function() {
    return parseInt(this.value) >= 4;
  }),

  checkedFive: computed("value", function() {
    return parseInt(this.value) >= 5;
  }),

  percentageOne: computed("value", "checkedOne", function() {
    if (!this.checkedOne) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }),

  percentageTwo: computed("value", "checkedOne", "checkedTwo", function() {
    if (this.checkedOne && !this.checkedTwo) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }),

  percentageThree: computed("value", "checkedTwo", "checkedThree", function() {
    if (this.checkedTwo && !this.checkedThree) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }),

  percentageFour: computed("value", "checkedThree", "checkedFour", function() {
    if (this.checkedThree && !this.checkedFour) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }),

  percentageFive: computed("value", "checkedFour", "checkedFive", function() {
    if (this.checkedFour && !this.checkedFive) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }),

  actions: {
    changeRating(value) {
      if (value && this.readOnly) return;

      if (value > 0) {
        this.set("value", value);
      } else {
        this.set("value", this.value);
      }
    }
  }
});
