
import AbstractView from '../framework/view/abstract-view.js';

const createSortingTemplate = (currentSortType) => `
  <form class="trip-events__trip-sort trip-sort" action="#" method="get">
    <div class="trip-sort__item trip-sort__item--day">
      <input id="sort-day" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="day" ${currentSortType === 'day' ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-day" data-sort-type="day">Day</label>
    </div>

    <div class="trip-sort__item trip-sort__item--event">
      <input id="sort-event" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="event" disabled>
      <label class="trip-sort__btn" for="sort-event" data-sort-type="event">Event</label>
    </div>

    <div class="trip-sort__item trip-sort__item--time">
      <input id="sort-time" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="time" ${currentSortType === 'time' ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-time" data-sort-type="time">Time</label>
    </div>

    <div class="trip-sort__item trip-sort__item--price">
      <input id="sort-price" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="price" ${currentSortType === 'price' ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-price" data-sort-type="price">Price</label>
    </div>

    <div class="trip-sort__item trip-sort__item--offer">
      <input id="sort-offer" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="offer" disabled>
      <label class="trip-sort__btn" for="sort-offer" data-sort-type="offer">Offers</label>
    </div>
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

    if (sortType === 'event' || sortType === 'offer' || this.#currentSortType === sortType) {
      return;
    }

    evt.preventDefault();
    this.#handleSortTypeChange(sortType);
  };
}
