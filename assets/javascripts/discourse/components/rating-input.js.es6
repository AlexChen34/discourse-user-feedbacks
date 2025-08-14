import Component from "@glimmer/component";
import { action } from "@ember/object";
import I18n from "I18n";

export default class RatingInput extends Component {
  get value() {
    return this.args.value || 0;
  }

  get readOnly() {
    return this.args.readOnly || false;
  }

  @action
  changeRating(value) {
    if (this.readOnly) return;
    
    if (this.args.onChange && typeof this.args.onChange === 'function') {
      this.args.onChange(value);
    }
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

  get ratingText() {
    switch(this.value) {
      case 1: return I18n.t("discourse_user_feedbacks.rating.positive");
      case 0: return I18n.t("discourse_user_feedbacks.rating.neutral");
      case -1: return I18n.t("discourse_user_feedbacks.rating.negative");
      default: return "Not rated";
    }
  }
}
