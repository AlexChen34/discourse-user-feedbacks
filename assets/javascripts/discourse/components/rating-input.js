import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class RatingInputComponent extends Component {
  @tracked value = this.args.value || 0;
  
  // Update value when args change
  get currentValue() {
    return this.args.value !== undefined ? this.args.value : this.value;
  }
  
  get checkedOne() {
    return parseFloat(this.currentValue) >= 1;
  }

  get checkedTwo() {
    return parseFloat(this.currentValue) >= 2;
  }

  get checkedThree() {
    return parseFloat(this.currentValue) >= 3;
  }

  get checkedFour() {
    return parseFloat(this.currentValue) >= 4;
  }

  get checkedFive() {
    return parseFloat(this.currentValue) >= 5;
  }

  get percentageOne() {
    if (!this.checkedOne && this.currentValue > 0 && this.currentValue < 1) {
      return ((Math.round(this.currentValue * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageTwo() {
    if (this.checkedOne && !this.checkedTwo && this.currentValue > 1 && this.currentValue < 2) {
      return ((Math.round(this.currentValue * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageThree() {
    if (this.checkedTwo && !this.checkedThree && this.currentValue > 2 && this.currentValue < 3) {
      return ((Math.round(this.currentValue * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageFour() {
    if (this.checkedThree && !this.checkedFour && this.currentValue > 3 && this.currentValue < 4) {
      return ((Math.round(this.currentValue * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  get percentageFive() {
    if (this.checkedFour && !this.checkedFive && this.currentValue > 4 && this.currentValue < 5) {
      return ((Math.round(this.currentValue * 100) / 100) % 1) * 100;
    }
    return 0;
  }

  @action
  changeRating(value) {
    if (this.args.readOnly) return;

    this.value = value;
    
    if (this.args.onChange) {
      this.args.onChange(this.value);
    }
  }
}
