import AbstractView from './abstract-view.js';
import { EVENT_TYPES, DESTINATIONS, OFFERS } from '../mock/mock.js';
import { formatDateTime } from '../utils.js';

const createEventEditTemplate = (event = null) => {
  const isNew = !event;
  const currentType = event?.type || 'flight';
  const currentDestination = event?.destination || DESTINATIONS[0];
  const dateFrom = event?.dateFrom || new Date();
  const dateTo = event?.dateTo || new Date();
  const basePrice = event?.basePrice || '';
  const currentOffers = event?.offers || [];

  const eventTypesTemplate = EVENT_TYPES.map((type) => `
    <div class="event__type-item">
      <input
        id="event-type-${type}-1"
        class="event__type-input visually-hidden"
        type="radio"
        name="event-type"
        value="${type}"
        ${type === currentType ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">
        ${type}
      </label>
    </div>
  `).join('');

  const destinationsTemplate = DESTINATIONS.map((destination) => `
    <option value="${destination.name}"></option>
  `).join('');

  const offers = OFFERS[currentType] || [];
  const offersTemplate = offers.length > 0
    ? `
      <section class="event__section event__section--offers">
        <h3 class="event__section-title event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${offers.map((offer) => `
            <div class="event__offer-selector">
              <input
                class="event__offer-checkbox visually-hidden"
                id="event-offer-${offer.id}"
                type="checkbox"
                name="event-offer-${offer.id}"
                ${currentOffers.some((o) => o.id === offer.id) ? 'checked' : ''}
              >
              <label class="event__offer-label" for="event-offer-${offer.id}">
                <span class="event__offer-title">${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${offer.price}</span>
              </label>
            </div>
          `).join('')}
        </div>
      </section>
    `
    : '';

  const destinationTemplate = currentDestination
    ? `
      <section class="event__section event__section--destination">
        <h3 class="event__section-title event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${currentDestination.description}</p>
        ${currentDestination.pictures.length > 0 ? `
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${currentDestination.pictures.map((picture) => `
                <img class="event__photo" src="${picture.src}" alt="${picture.description}">
              `).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    `
    : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${currentType}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypesTemplate}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${currentType}
            </label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${currentDestination.name}"
              list="destination-list-1"
            >
            <datalist id="destination-list-1">
              ${destinationsTemplate}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${formatDateTime(dateFrom)}"
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${formatDateTime(dateTo)}"
            >
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${basePrice}"
            >
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${isNew ? 'Cancel' : 'Delete'}</button>
          ${!isNew ? `
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          ` : ''}
        </header>
        <section class="event__details">
          ${offersTemplate}
          ${destinationTemplate}
        </section>
      </form>
    </li>
  `;
};

class EventEditView extends AbstractView {
  #event = null;

  constructor(event = null) {
    super();
    this.#event = event;
  }

  get template() {
    return createEventEditTemplate(this.#event);
  }
}

export default EventEditView;
