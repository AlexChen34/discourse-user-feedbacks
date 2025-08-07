import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class RatingInputComponent extends Component {
  @tracked value = this.args.value || 0;
  
  get checkedOne() {
    return parseInt(this.value) >= 1;
  }

  get checkedTwo() {
    return parseInt(this.value) >= 2;
  }

  get checkedThree() {
    return parseInt(this.value) >= 3;
  }

  get checkedFour() {
    return parseInt(this.value) >= 4;
  }

  get checkedFive() {
    return parseInt(this.value) >= 5;
  }

  get percentageOne() {
    if (!this.checkedOne) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageTwo() {
    if (this.checkedOne && !this.checkedTwo) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageThree() {
    if (this.checkedTwo && !this.checkedThree) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageFour() {
    if (this.checkedThree && !this.checkedFour) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageFive() {
    if (this.checkedFour && !this.checkedFive) {
      return ((Math.round(this.value * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  @action
  changeRating(value) {
    if (value && this.args.readOnly) return;

    if (value > 0) {
      this.value = value;
    }
    
    if (this.args.onChange) {
      this.args.onChange(this.value);
    }
  }
}
