
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { DateMap, huminazeDate } from '../util.js';
import { POINT_TYPES, POINT_DESTINATIONS } from '../const.js';

const createPointOffer = (offer, checkedOffers) => {
  const { id: offerId, title, price } = offer;
  const isOfferChecked = checkedOffers.some(item => item.id === offerId) ? 'checked' : '';

  return `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="event-offer-${offerId}" type="checkbox" name="event-offer-${offerId}" ${isOfferChecked}>
      <label class="event__offer-label" for="event-offer-${offerId}">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>
  `;
};

const createPointOffers = (pointOffers, checkedOffers) => {
  if (!pointOffers.offers || pointOffers.offers.length === 0) {
    return '';
  }

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${pointOffers.offers.map((offer) => createPointOffer(offer, checkedOffers)).join('')}
      </div>
    </section>
  `;
};

const createPointEditFormTemplate = (point, pointOffers, checkedOffers, destination, isNew = false) => {
  const { id, type, basePrice, dateFrom, dateTo } = point;
  const { name, description, pictures } = destination;

  const createPointTypes = () => POINT_TYPES.map((item) => `
    <div class="event__type-item">
      <input id="event-type-${item}-${id}" class="event__type-input visually-hidden" type="radio" name="event-type" value="${item}" ${item === type ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${item}" for="event-type-${item}-${id}">${item}</label>
    </div>
  `).join('');

  const createPointDestinations = () => POINT_DESTINATIONS.map((item) => `
    <option value="${item}"></option>
  `).join('');

  const createPointPhotos = () => pictures && pictures.length
    ? `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${pictures.map((picture) =>
            `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
          ).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-${id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-${id}" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createPointTypes()}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-${id}">
              ${type}
            </label>
            <input class="event__input event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${name}" list="destination-list-${id}">
            <datalist id="destination-list-${id}">
              ${createPointDestinations()}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${id}">From</label>
            <input class="event__input event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${huminazeDate(dateFrom, DateMap.get('DateTime'))}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${huminazeDate(dateTo, DateMap.get('DateTime'))}">
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-${id}" type="text" name="event-price" value="${basePrice}">
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${isNew ? 'Cancel' : 'Delete'}</button>
          ${!isNew ? `
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Close event</span>
            </button>
          ` : ''}
        </header>
        <section class="event__details">
          ${createPointOffers(pointOffers, checkedOffers)}
          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${description}</p>
            ${createPointPhotos()}
          </section>
        </section>
      </form>
    </li>
  `;
};

export default class PointEditFormView extends AbstractStatefulView {
  #point = null;
  #offers = null;
  #checkedOffers = null;
  #destination = null;
  #isNew = false;
  #handleFormSubmit = null;
  #handleCloseClick = null;
  #handleDeleteClick = null;

  constructor({ point, offers, checkedOffers, destination, isNew = false, onSubmit, onClose, onDelete }) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#checkedOffers = checkedOffers;
    this.#destination = destination;
    this.#isNew = isNew;
    this.#handleFormSubmit = onSubmit;
    this.#handleCloseClick = onClose;
    this.#handleDeleteClick = onDelete;

    this._setState({
      point: this.#point,
      offers: this.#offers,
      checkedOffers: this.#checkedOffers,
      destination: this.#destination
    });

    this._restoreHandlers();
  }

  get template() {
    return createPointEditFormTemplate(
      this._state.point,
      this._state.offers,
      this._state.checkedOffers,
      this._state.destination,
      this.#isNew
    );
  }

  _restoreHandlers() {
    if (!this.#isNew) {
      this.element.querySelector('.event__rollup-btn')
        .addEventListener('click', this.#closeClickHandler);
    }

    const resetButton = this.element.querySelector('.event__reset-btn');
    if (this.#isNew) {
      resetButton.addEventListener('click', this.#closeClickHandler);
    } else {
      resetButton.addEventListener('click', this.#deleteClickHandler);
    }

    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick();
  };
}
