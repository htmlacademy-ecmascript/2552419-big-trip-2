import AbstractView from '../view/abstract-view.js';

const createErrorMessageTemplate = () => `
  <p class="trip-events__msg">Failed to load latest route information</p>
`;

export default class ErrorMessageView extends AbstractView {
  get template() {
    return createErrorMessageTemplate();
  }
}
