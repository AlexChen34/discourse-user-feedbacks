import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class RatingInputComponent extends Component {
  @tracked value = 0;
  
  constructor() {
    super(...arguments);
    // Initialize with the passed value
    this.value = this.args.value || 0;
  }
  
  // Always use the current args.value if available, otherwise use internal value
  get currentValue() {
    return this.args.value !== undefined ? parseFloat(this.args.value) : parseFloat(this.value);
  }
  
  get checkedOne() {
    return this.currentValue >= 1;
  }

  get checkedTwo() {
    return this.currentValue >= 2;
  }

  get checkedThree() {
    return this.currentValue >= 3;
  }

  get checkedFour() {
    return this.currentValue >= 4;
  }

  get checkedFive() {
    return this.currentValue >= 5;
  }

  get percentageOne() {
    if (!this.checkedOne && this.currentValue > 0 && this.currentValue < 1) {
      return (this.currentValue % 1) * 100;
    }
    return 0;
  }

  get percentageTwo() {
    if (this.checkedOne && !this.checkedTwo && this.currentValue > 1 && this.currentValue < 2) {
      return (this.currentValue % 1) * 100;
    }
    return 0;
  }

  get percentageThree() {
    if (this.checkedTwo && !this.checkedThree && this.currentValue > 2 && this.currentValue < 3) {
      return (this.currentValue % 1) * 100;
    }
    return 0;
  }

  get percentageFour() {
    if (this.checkedThree && !this.checkedFour && this.currentValue > 3 && this.currentValue < 4) {
      return (this.currentValue % 1) * 100;
    }
    return 0;
  }

  get percentageFive() {
    if (this.checkedFour && !this.checkedFive && this.currentValue > 4 && this.currentValue < 5) {
      return (this.currentValue % 1) * 100;
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
