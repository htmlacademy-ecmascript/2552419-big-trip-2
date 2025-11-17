import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { humanizeDate, isEscapeKey } from '../util.js';
import { POINT_TYPES } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

const createPointEditFormTemplate = (point, offers, checkedOffers, destination, allDestinations, allOffers, isNew) => {
  const {
    type,
    dateFrom,
    dateTo,
    basePrice,
    isFavorite,
    isDisabled = false,
    isSaving = false,
    isDeleting = false
  } = point;

  const favoriteChecked = isFavorite ? 'checked' : '';
  const saveButtonText = isSaving ? 'Saving...' : 'Save';
  const resetButtonBaseText = isNew ? 'Cancel' : 'Delete';
  const resetButtonText = isDeleting ? 'Deleting...' : resetButtonBaseText;
  const isFormDisabled = isDisabled || isSaving || isDeleting;

  const typeListTemplate = POINT_TYPES.map((pointType) => `
    <div class="event__type-item">
      <input id="event-type-${pointType}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${pointType}" ${pointType === type ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${pointType}" for="event-type-${pointType}-1">${pointType}</label>
    </div>
  `).join('');

  const destinationsOptions = allDestinations.map((dest) => `
    <option value="${he.encode(dest.name)}"></option>
  `).join('');

  const offersTemplate = offers.offers.map((offer) => {
    const isChecked = checkedOffers.some((checkedOffer) => checkedOffer.id === offer.id);
    return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer-${offer.id}" ${isChecked ? 'checked' : ''}>
        <label class="event__offer-label" for="event-offer-${offer.id}-1">
          <span class="event__offer-title">${he.encode(offer.title)}</span>
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

  const destinationName = destination ? he.encode(destination.name) : '';
  const shouldShowDestinationSection = destination && destination.description;
  const destinationInfo = shouldShowDestinationSection ? `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${he.encode(destination.description)}</p>
      ${destination.pictures && destination.pictures.length > 0 ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map((picture) => `
              <img class="event__photo" src="${he.encode(picture.src)}" alt="${he.encode(picture.description)}">
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  ` : '';

  const dateFromValue = dateFrom ? humanizeDate(dateFrom, 'DD/MM/YY HH:mm') : '';
  const dateToValue = dateTo ? humanizeDate(dateTo, 'DD/MM/YY HH:mm') : '';

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
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFromValue}" required>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateToValue}" required>
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="0" required>
          </div>

          <button class="event__save-btn btn btn--blue" type="submit" ${isFormDisabled ? 'disabled' : ''}>${saveButtonText}</button>
          <button class="event__reset-btn" type="button" ${isFormDisabled ? 'disabled' : ''}>${resetButtonText}</button>
          ${!isNew ? `<button class="event__rollup-btn" type="button" ${isFormDisabled ? 'disabled' : ''}><span class="visually-hidden">Open event</span></button>` : ''}
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
  constructor({ point, offers, checkedOffers, destination, allDestinations, allOffers, isNew, onSubmit, onClose, onDelete }) {
    super();

    this._setState(PointEditFormView.parsePointToState(point));
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
      this.#isNew
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

  setSaving() {
    if (this._state.isSaving) {
      return;
    }

    this._setState({
      isDisabled: true,
      isSaving: true,
      isDeleting: false
    });
    this.#updateControlsState();
  }

  setDeleting() {
    if (this._state.isDeleting) {
      return;
    }

    this._setState({
      isDisabled: true,
      isSaving: false,
      isDeleting: true
    });
    this.#updateControlsState();
  }

  setAborting() {
    this._setState({
      isDisabled: false,
      isSaving: false,
      isDeleting: false
    });
    this.#updateControlsState();
  }

  resetState() {
    if (!this._state.isDisabled && !this._state.isSaving && !this._state.isDeleting) {
      return;
    }

    this._setState({
      isDisabled: false,
      isSaving: false,
      isDeleting: false
    });
    this.#updateControlsState();
  }

  #updateControlsState() {
    if (!this.element) {
      return;
    }

    const shouldDisable = Boolean(this._state.isDisabled || this._state.isSaving || this._state.isDeleting);

    const saveButton = this.element.querySelector('.event__save-btn');
    if (saveButton) {
      saveButton.textContent = this._state.isSaving ? 'Saving...' : 'Save';
      saveButton.disabled = shouldDisable;
    }

    const resetButton = this.element.querySelector('.event__reset-btn');
    if (resetButton) {
      const baseText = this.#isNew ? 'Cancel' : 'Delete';
      const buttonText = (!this.#isNew && this._state.isDeleting) ? 'Deleting...' : baseText;
      resetButton.textContent = buttonText;
      resetButton.disabled = this.#isNew ? false : shouldDisable;
    }

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.disabled = shouldDisable;
    }

    this.#setFormElementsDisabled(shouldDisable);
  }

  #setFormElementsDisabled(disabled) {
    if (!this.element) {
      return;
    }

    const inputs = this.element.querySelectorAll('input');
    inputs.forEach((input) => {
      if (input.classList.contains('event__save-btn') || input.classList.contains('event__reset-btn')) {
        return;
      }
      input.disabled = disabled;
    });

    const selects = this.element.querySelectorAll('select');
    selects.forEach((select) => {
      select.disabled = disabled;
    });

    if (this.#dateFromPicker) {
      this.#dateFromPicker._input.disabled = disabled;
    }

    if (this.#dateToPicker) {
      this.#dateToPicker._input.disabled = disabled;
    }

    const typeButtons = this.element.querySelectorAll('.event__type-btn, .event__type-label, .event__favorite-btn, .event__offer-label');
    typeButtons.forEach((element) => {
      element.style.pointerEvents = disabled ? 'none' : 'auto';
    });
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
    this.element.querySelector('.event__favorite-checkbox').addEventListener('change', this.#favoriteChangeHandler);

    if (this.#offers.offers.length > 0) {
      this.element.querySelector('.event__available-offers').addEventListener('change', this.#offersChangeHandler);
    }

    document.addEventListener('keydown', this.#escKeyDownHandler);

    this.#setDatePickers();
    this.#updateControlsState();
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

    const defaultDateFrom = this._state.dateFrom ? new Date(this._state.dateFrom) : null;
    const defaultDateTo = this._state.dateTo ? new Date(this._state.dateTo) : null;

    const minDateTo = defaultDateFrom || new Date();

    this.#dateFromPicker = flatpickr(
      this.element.querySelector('[id^="event-start-time"]'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: defaultDateFrom,
        onChange: this.#dateFromChangeHandler,
        onClose: this.#validateDates.bind(this)
      }
    );

    this.#dateToPicker = flatpickr(
      this.element.querySelector('[id^="event-end-time"]'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: defaultDateTo,
        minDate: minDateTo,
        onChange: this.#dateToChangeHandler,
        onClose: this.#validateDates.bind(this)
      }
    );
  }

  #validateDates() {
    const dateFrom = this.#dateFromPicker.selectedDates[0];
    const dateTo = this.#dateToPicker.selectedDates[0];

    if (dateFrom && dateTo && dateTo < dateFrom) {
      this.#dateToPicker.setDate(dateFrom);
      this.#updateStateWithoutRerender({
        dateTo: dateFrom.toISOString()
      });
    }
  }

  #onEscKeyDown(evt) {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      if (!this._state.isDisabled && !this._state.isSaving && !this._state.isDeleting) {
        this.#handleClose();
      }
    }
  }

  #dateFromChangeHandler = ([userDate]) => {
    if (userDate) {
      this.#updateStateWithoutRerender({
        dateFrom: userDate.toISOString()
      });

      if (this.#dateToPicker) {
        this.#dateToPicker.set('minDate', userDate);
      }
    }
  };

  #dateToChangeHandler = ([userDate]) => {
    if (userDate) {
      this.#updateStateWithoutRerender({
        dateTo: userDate.toISOString()
      });
    }
  };

  #updateStateWithoutRerender(update) {
    this._state = structuredClone({...this._state, ...update});
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    const dateFrom = this._state.dateFrom ? new Date(this._state.dateFrom) : null;
    const dateTo = this._state.dateTo ? new Date(this._state.dateTo) : null;

    if (dateFrom && dateTo && dateTo < dateFrom) {
      this._setState({
        dateTo: dateFrom.toISOString()
      });
    }

    this.setSaving();
    this.#handleSubmit(PointEditFormView.parseStateToPoint(this._state));
  };

  #resetButtonClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#isNew) {
      if (this._state.isSaving) {
        this.setAborting();
      } else {
        this.#handleClose();
      }
    } else {
      if (!this._state.isDisabled && !this._state.isSaving && !this._state.isDeleting) {
        this.setDeleting();
        this.#handleDelete();
      }
    }
  };

  #rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    if (!this._state.isDisabled && !this._state.isSaving && !this._state.isDeleting) {
      this.#handleClose();
    }
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
    const value = Math.max(0, parseInt(evt.target.value) || 0);
    this._setState({
      basePrice: value
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

  static parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    return point;
  }

  isDeleting() {
    return Boolean(this._state.isDeleting);
  }
}
