import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { humanizeDate, isEscapeKey } from '../util.js';
import { POINT_TYPES } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const createPointEditFormTemplate = (point, offers, checkedOffers, destination, allDestinations, allOffers, isNew, isSaving, isDeleting) => {
  const { type, dateFrom, dateTo, basePrice, isFavorite } = point;

  const favoriteChecked = isFavorite ? 'checked' : '';

  const typeListTemplate = POINT_TYPES.map((pointType) => `
    <div class="event__type-item">
      <input id="event-type-${pointType}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${pointType}" ${pointType === type ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${pointType}" for="event-type-${pointType}-1">${pointType}</label>
    </div>
  `).join('');

  const destinationsOptions = allDestinations.map((dest) => `
    <option value="${dest.name}"></option>
  `).join('');

  const offersTemplate = offers.offers.map((offer) => {
    const isChecked = checkedOffers.some((checkedOffer) => checkedOffer.id === offer.id);
    return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer-${offer.id}" ${isChecked ? 'checked' : ''}>
        <label class="event__offer-label" for="event-offer-${offer.id}-1">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');

  const hasOffers = offers.offers.length > 0;
  const offersSection = hasOffers ? `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersTemplate}
      </div>
    </section>
  ` : '';

  const destinationName = destination ? destination.name : '';
  const shouldShowDestinationSection = destination && destination.description;
  const destinationInfo = shouldShowDestinationSection ? `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>
      ${destination.pictures && destination.pictures.length > 0 ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map((picture) => `
              <img class="event__photo" src="${picture.src}" alt="${picture.description}">
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  ` : '';

  const saveButtonText = isSaving ? 'Saving...' : 'Save';
  const deleteButtonText = isDeleting ? 'Deleting...' : 'Delete';
  const resetButtonText = isNew ? 'Cancel' : deleteButtonText;

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typeListTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1" required>
            <datalist id="destination-list-1">
              ${destinationsOptions}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom ? humanizeDate(dateFrom, 'DD/MM/YY HH:mm') : ''}" required>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo ? humanizeDate(dateTo, 'DD/MM/YY HH:mm') : ''}" required>
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="0" required>
          </div>

          <button class="event__save-btn btn btn--blue" type="submit" ${isSaving ? 'disabled' : ''}>${saveButtonText}</button>
          <button class="event__reset-btn" type="button" ${isDeleting ? 'disabled' : ''}>${resetButtonText}</button>
          ${!isNew ? '<button class="event__rollup-btn" type="button"><span class="visually-hidden">Open event</span></button>' : ''}
          <input id="event-favorite-1" class="event__favorite-checkbox visually-hidden" type="checkbox" name="event-favorite" ${favoriteChecked}>
          <label class="event__favorite-btn" for="event-favorite-1">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
            </svg>
          </label>
        </header>
        <section class="event__details">
          ${offersSection}
          ${destinationInfo}
        </section>
      </form>
    </li>
  `;
};

export default class PointEditFormView extends AbstractStatefulView {
  #offers = null;
  #checkedOffers = null;
  #destination = null;
  #allDestinations = null;
  #allOffers = null;
  #isNew = null;
  #handleSubmit = null;
  #handleClose = null;
  #handleDelete = null;
  #dateFromPicker = null;
  #dateToPicker = null;
  #escKeyDownHandler = null;

  #initialState = null;
  #initialOffers = null;
  #initialCheckedOffers = null;
  #initialDestination = null;

  constructor({ point, offers, checkedOffers, destination, allDestinations, allOffers, isNew, onSubmit, onClose, onDelete }) {
    super();

    this.#initialState = PointEditFormView.parsePointToState(point);
    this.#initialOffers = offers;
    this.#initialCheckedOffers = checkedOffers;
    this.#initialDestination = destination;

    this._setState(this.#initialState);
    this.#offers = offers;
    this.#checkedOffers = checkedOffers;
    this.#destination = destination;
    this.#allDestinations = allDestinations;
    this.#allOffers = allOffers;
    this.#isNew = isNew;
    this.#handleSubmit = onSubmit;
    this.#handleClose = onClose;
    this.#handleDelete = onDelete;

    this.#escKeyDownHandler = this.#onEscKeyDown.bind(this);

    this._restoreHandlers();
  }

  get template() {
    return createPointEditFormTemplate(
      this._state,
      this.#offers,
      this.#checkedOffers,
      this.#destination,
      this.#allDestinations,
      this.#allOffers,
      this.#isNew,
      this._state.isSaving,
      this._state.isDeleting
    );
  }

  removeElement() {
    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
      this.#dateFromPicker = null;
    }

    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
      this.#dateToPicker = null;
    }

    document.removeEventListener('keydown', this.#escKeyDownHandler);

    super.removeElement();
  }

  _restoreHandlers() {
    this.element.querySelector('.event--edit').addEventListener('submit', this.#formSubmitHandler);

    const resetButton = this.element.querySelector('.event__reset-btn');
    if (resetButton) {
      resetButton.addEventListener('click', this.#resetButtonClickHandler);
    }

    if (!this.#isNew) {
      const rollupButton = this.element.querySelector('.event__rollup-btn');
      if (rollupButton) {
        rollupButton.addEventListener('click', this.#rollupButtonClickHandler);
      }
    }

    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);
    this.element.querySelector('.event__favorite-checkbox').addEventListener('change', this.#favoriteChangeHandler);

    if (this.#offers.offers.length > 0) {
      this.element.querySelector('.event__available-offers').addEventListener('change', this.#offersChangeHandler);
    }

    document.addEventListener('keydown', this.#escKeyDownHandler);

    this.#setDatePickers();
  }

  #setDatePickers() {
    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
      this.#dateFromPicker = null;
    }
    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
      this.#dateToPicker = null;
    }

    this.#dateFromPicker = flatpickr(
      this.element.querySelector('[id^="event-start-time"]'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom || null,
        onChange: this.#dateFromChangeHandler
      }
    );

    this.#dateToPicker = flatpickr(
      this.element.querySelector('[id^="event-end-time"]'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo || null,
        onChange: this.#dateToChangeHandler
      }
    );
  }

  #onEscKeyDown(evt) {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#resetToInitialState();
      this.#handleClose();
    }
  }

  #resetToInitialState() {
    if (!this.#isNew) {
      this._setState(this.#initialState);
      this.#offers = this.#initialOffers;
      this.#checkedOffers = this.#initialCheckedOffers;
      this.#destination = this.#initialDestination;
    } else {
      this._setState(PointEditFormView.parsePointToState({
        id: null,
        type: 'flight',
        dateFrom: null,
        dateTo: null,
        destination: null,
        basePrice: 0,
        isFavorite: false,
        offers: []
      }));
      this.#offers = this.#allOffers.find((offer) => offer.type === 'flight') || { offers: [] };
      this.#checkedOffers = [];
      this.#destination = null;
    }
  }

  #dateFromChangeHandler = ([userDate]) => {
    this.#updateStateWithoutRerender({
      dateFrom: userDate ? userDate.toISOString() : null
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    this.#updateStateWithoutRerender({
      dateTo: userDate ? userDate.toISOString() : null
    });
  };

  #updateStateWithoutRerender(update) {
    this._state = structuredClone({...this._state, ...update});
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSubmit(PointEditFormView.parseStateToPoint(this._state));
  };

  #resetButtonClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#isNew) {
      this.#resetToInitialState();
      this.#handleClose();
    } else {
      this.#handleDelete();
    }
  };

  #rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#resetToInitialState();
    this.#handleClose();
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const newType = evt.target.value;
    const newOffers = this.#allOffers.find((offer) => offer.type === newType) || { offers: [] };

    this.#offers = newOffers;
    this.#checkedOffers = [];

    this.updateElement({
      type: newType,
      offers: []
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const selectedDestination = this.#allDestinations.find((destination) => destination.name === evt.target.value);

    if (selectedDestination) {
      this.#destination = selectedDestination;
      this.updateElement({
        destination: selectedDestination.id
      });
    } else {
      this.#destination = null;
      this.updateElement({
        destination: null
      });
    }
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: Number(evt.target.value)
    });
  };

  #priceInputHandler = (evt) => {
    this._setState({
      basePrice: Number(evt.target.value)
    });
  };

  #favoriteChangeHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      isFavorite: evt.target.checked
    });
  };

  #offersChangeHandler = (evt) => {
    evt.preventDefault();
    const offerId = evt.target.name.replace('event-offer-', '');
    const offer = this.#offers.offers.find((item) => item.id === offerId);

    if (!offer) {
      return;
    }

    const offers = [...this._state.offers];

    if (evt.target.checked) {
      offers.push(offerId);
    } else {
      const index = offers.indexOf(offerId);
      if (index !== -1) {
        offers.splice(index, 1);
      }
    }

    this._setState({
      offers
    });
  };

  setSaving() {
    this.updateElement({
      isSaving: true
    });
  }

  setDeleting() {
    this.updateElement({
      isDeleting: true
    });
  }

  static parsePointToState(point) {
    return {
      ...point,
      isSaving: false,
      isDeleting: false
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.isSaving;
    delete point.isDeleting;
    return point;
  }
}
