import AbstractView from '../framework/view/abstract-view.js';

const EMPTY_FILTER_COUNT = 0;

const createFilterItemTemplate = (filter, isChecked, isDisabled) => {
  const { type, name } = filter;

  return `
    <div class="trip-filters__filter">
      <input
        id="filter-${type}"
        class="trip-filters__filter-input visually-hidden"
        type="radio"
        name="trip-filter"
        value="${type}"
        ${isChecked ? 'checked' : ''}
        ${isDisabled ? 'disabled' : ''}
      >
      <label class="trip-filters__filter-label" for="filter-${type}">
        ${name}
      </label>
    </div>
  `;
};

const createFiltersTemplate = (filters, currentFilter) => `
  <form class="trip-filters" action="#" method="get">
    ${filters.map((filter) => {
      const isChecked = filter.type === currentFilter;
      const isDisabled = filter.count === EMPTY_FILTER_COUNT;
      return createFilterItemTemplate(filter, isChecked, isDisabled);
    }).join('')}
    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>
`;

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilter = null;

  constructor(filters, currentFilter) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this._callback = {};
  }

  get template() {
    return createFiltersTemplate(this.#filters, this.#currentFilter);
  }

  setFilterChangeHandler(callback) {
    this._callback.filterChange = callback;
    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  #filterChangeHandler = (evt) => {
    evt.preventDefault();
    this._callback.filterChange(evt.target.value);
  };
}
