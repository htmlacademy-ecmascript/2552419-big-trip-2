import AbstractView from '../view/abstract-view.js';

const createHeaderTemplate = () => `
  <header class="page-header">
    <div class="page-body__container  page-header__container">
      <img class="page-header__logo" src="img/logo.png" width="42" height="42" alt="Trip logo">
      <div class="trip-main">
        <!-- TripInfo и Filter будут вставлены здесь -->
      </div>
    </div>
  </header>
`;

export default class HeaderView extends AbstractView {
  get template() {
    return createHeaderTemplate();
  }
}

