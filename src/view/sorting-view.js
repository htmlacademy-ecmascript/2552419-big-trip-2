import AbstractView from '../framework/view/abstract-view.js';
import { SortType, EnabledSortType } from '../const.js';

const createSortingItemTemplate = (sortType, currentSortType) => {
  const isChecked = sortType === currentSortType;
  const isDisabled = !EnabledSortType[sortType];

  return `
    <div class="trip-sort__item trip-sort__item--${sortType}">
      <input
        id="sort-${sortType}"
        class="trip-sort__input visually-hidden"
        type="radio"
        name="trip-sort"
        value="${sortType}"
        ${isChecked ? 'checked' : ''}
        ${isDisabled ? 'disabled' : ''}
      >
      <label class="trip-sort__btn" for="sort-${sortType}" data-sort-type="${sortType}">
        ${sortType.charAt(0).toUpperCase() + sortType.slice(1)}
      </label>
    </div>
  `;
};

const createSortingTemplate = (currentSortType) => `
  <form class="trip-events__trip-sort trip-sort" action="#" method="get">
    ${Object.values(SortType).map(sortType =>
      createSortingItemTemplate(sortType, currentSortType)
    ).join('')}
  </form>
`;

export default class SortingView extends AbstractView {
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({ currentSortType, onSortTypeChange }) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortingTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    const sortType = evt.target.dataset.sortType;

    if (!EnabledSortType[sortType] || this.#currentSortType === sortType) {
      return;
    }

    evt.preventDefault();
    this.#handleSortTypeChange(sortType);
  };
}
