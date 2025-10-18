
import AbstractView from '../framework/view/abstract-view.js';

const createFilterItemTemplate = (filter, isChecked, isDisabled) => {
  const { type, name, count } = filter;

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
        ${name} ${count > 0 ? `(${count})` : ''}
      </label>
    </div>
  `;
};

const createFiltersTemplate = (filters) => `
  <form class="trip-filters" action="#" method="get">
    ${filters.map((filter, index) =>
      createFilterItemTemplate(filter, index === 0, filter.count === 0)
    ).join('')}
    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>
`;

export default class FiltersView extends AbstractView {
  #filters = null;

  constructor(filters) {
    super();
    this.#filters = filters;

    
    this._callback = {};
  }

  get template() {
    return createFiltersTemplate(this.#filters);
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
