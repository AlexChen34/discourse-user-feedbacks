import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class RatingInput extends Component {
  @tracked internalValue = this.args.value || 0;

  get value() {
    return this.args.value !== undefined ? this.args.value : this.internalValue;
  }

  get isPositive() {
    return this.value === 1;
  }

  get isNeutral() {
    return this.value === 0;
  }

  get isNegative() {
    return this.value === -1;
  }

  get readOnly() {
    return this.args.readOnly || false;
  }

  @action
  changeRating(value) {
    if (this.readOnly) return;
    
    this.internalValue = value;
    
    // Call the parent's onChange callback if provided
    if (this.args.onChange) {
      this.args.onChange(value);
    }
  }
}
