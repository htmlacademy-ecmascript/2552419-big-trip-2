import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { DateMap, huminazeDate } from '../util.js';
import { POINT_TYPES } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

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

const createPointEditFormTemplate = (state) => {
  const { point, offers, checkedOffers, destination, isNew, isTypeListOpen } = state;
  const { id, type, basePrice, dateFrom, dateTo } = point;
  const { name, description, pictures } = destination || {};

  const createPointTypes = () => POINT_TYPES.map((item) => `
    <div class="event__type-item">
      <input id="event-type-${item}-${id}" class="event__type-input visually-hidden" type="radio" name="event-type" value="${item}" ${item === type ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${item}" for="event-type-${item}-${id}">${item}</label>
    </div>
  `).join('');

  const createPointDestinations = (allDestinations) => {
    if (!allDestinations || allDestinations.length === 0) {
      return '';
    }

    return allDestinations.map(dest =>
      `<option value="${dest.name}"></option>`
    ).join('');
  };

  const createPointPhotos = () => {
    if (!pictures || pictures.length === 0) {
      return '';
    }

    return `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${pictures.map((picture) =>
            `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
          ).join('')}
        </div>
      </div>
    `;
  };

  const deleteButtonText = isNew ? 'Cancel' : 'Delete';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-${id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-${id}" type="checkbox" ${isTypeListOpen ? 'checked' : ''}>
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
            <input class="event__input event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${name || ''}" list="destination-list-${id}" autocomplete="off" required>
            <datalist id="destination-list-${id}">
              ${createPointDestinations(state.allDestinations)}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${id}">From</label>
            <input class="event__input event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${huminazeDate(dateFrom, DateMap.get('DateTime'))}" readonly>
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${huminazeDate(dateTo, DateMap.get('DateTime'))}" readonly>
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-${id}" type="number" name="event-price" value="${basePrice}" min="0" required>
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${deleteButtonText}</button>
          ${!isNew ? `
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Close event</span>
            </button>
          ` : ''}
        </header>
        <section class="event__details">
          ${createPointOffers(offers, checkedOffers)}
          ${destination ? `
            <section class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${description || 'No description available'}</p>
              ${createPointPhotos()}
            </section>
          ` : ''}
        </section>
      </form>
    </li>
  `;
};

export default class PointEditFormView extends AbstractStatefulView {
  #handleFormSubmit = null;
  #handleCloseClick = null;
  #handleDeleteClick = null;
  #isNew = false;
  #allDestinations = [];
  #allOffers = [];
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({ point, offers, checkedOffers, destination, allDestinations, allOffers, isNew = false, onSubmit, onClose, onDelete }) {
    super();
    this.#isNew = isNew;
    this.#handleFormSubmit = onSubmit;
    this.#handleCloseClick = onClose;
    this.#handleDeleteClick = onDelete;
    this.#allDestinations = allDestinations || [];
    this.#allOffers = allOffers || [];

    this._setState({
      point: { ...point },
      offers: { ...offers },
      checkedOffers: [...checkedOffers],
      destination: destination ? { ...destination } : null,
      allDestinations: this.#allDestinations,
      isNew,
      isTypeListOpen: false
    });

    this._restoreHandlers();
  }

  get template() {
    return createPointEditFormTemplate(this._state);
  }

  _restoreHandlers() {
    if (!this.#isNew) {
      const rollupBtn = this.element.querySelector('.event__rollup-btn');
      if (rollupBtn) {
        rollupBtn.addEventListener('click', this.#closeClickHandler);
      }
    }

    const resetButton = this.element.querySelector('.event__reset-btn');
    if (resetButton) {
      resetButton.addEventListener('click', this.#resetClickHandler);
    }

    const form = this.element.querySelector('form');
    if (form) {
      form.addEventListener('submit', this.#formSubmitHandler);
    }

    const typeToggle = this.element.querySelector('.event__type-toggle');
    if (typeToggle) {
      typeToggle.addEventListener('change', this.#typeToggleHandler);
    }

    const typeInputs = this.element.querySelectorAll('.event__type-input');
    typeInputs.forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('change', this.#destinationChangeHandler);
    }

    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) {
      priceInput.addEventListener('input', this.#priceInputHandler);
      priceInput.addEventListener('blur', this.#priceBlurHandler);
    }

    const offerCheckboxes = this.element.querySelectorAll('.event__offer-checkbox');
    offerCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this.#offerChangeHandler);
    });

    this.#initFlatpickr();

    document.addEventListener('click', this.#outsideClickHandler);
  }

  #resetClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#isNew) {
      this.#handleCloseClick();
    } else {
      this.#handleDeleteClick();
    }
  };

  #initFlatpickr() {
    const pointId = this._state.point.id;
    const startDateElement = this.element.querySelector(`#event-start-time-${pointId}`);
    const endDateElement = this.element.querySelector(`#event-end-time-${pointId}`);

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
    }

    const flatpickrConfig = {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      time_24hr: true,
      allowInput: false,
      clickOpens: true,
      static: false,
      monthSelectorType: 'static',
      locale: {
        firstDayOfWeek: 1
      },
      onOpen: () => {
        const calendar = document.querySelector('.flatpickr-calendar');
        if (calendar) {
          calendar.style.zIndex = '9999';
        }
      }
    };

    const currentDateFrom = this._state.point.dateFrom ? new Date(this._state.point.dateFrom) : null;
    const currentDateTo = this._state.point.dateTo ? new Date(this._state.point.dateTo) : null;

    if (startDateElement) {
      this.#datepickerFrom = flatpickr(startDateElement, {
        ...flatpickrConfig,
        defaultDate: currentDateFrom,
        maxDate: currentDateTo,
        onChange: this.#dateFromChangeHandler
      });
    }

    if (endDateElement) {
      this.#datepickerTo = flatpickr(endDateElement, {
        ...flatpickrConfig,
        defaultDate: currentDateTo,
        minDate: currentDateFrom,
        onChange: this.#dateToChangeHandler
      });
    }
  }

  #dateFromChangeHandler = ([userDate]) => {
    if (userDate) {
      this.updateElement({
        point: {
          ...this._state.point,
          dateFrom: userDate.toISOString()
        }
      });

      if (this.#datepickerTo) {
        this.#datepickerTo.set('minDate', userDate);
      }
    }
  };

  #dateToChangeHandler = ([userDate]) => {
    if (userDate) {
      this.updateElement({
        point: {
          ...this._state.point,
          dateTo: userDate.toISOString()
        }
      });

      if (this.#datepickerFrom) {
        this.#datepickerFrom.set('maxDate', userDate);
      }
    }
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const dateFrom = new Date(this._state.point.dateFrom);
    const dateTo = new Date(this._state.point.dateTo);

    if (dateFrom >= dateTo) {
      alert('Дата начала должна быть раньше даты окончания');
      return;
    }

    const destinationInput = this.element.querySelector('.event__input--destination');
    const destinationName = destinationInput.value;
    const isValidDestination = this.#allDestinations.some(dest => dest.name === destinationName);

    if (!isValidDestination) {
      alert('Пожалуйста, выберите пункт назначения из списка');
      destinationInput.focus();
      return;
    }

    const priceInput = this.element.querySelector('.event__input--price');
    const priceValue = parseInt(priceInput.value, 10);

    if (isNaN(priceValue) || priceValue < 0) {
      alert('Цена должна быть положительным числом');
      priceInput.focus();
      return;
    }

    this.#handleFormSubmit(this._state.point);
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  #typeToggleHandler = (evt) => {
    this.updateElement({
      isTypeListOpen: evt.target.checked
    });
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const newType = evt.target.value;

    const newOffers = this.#allOffers.find(offer => offer.type === newType) || { offers: [] };

    this.updateElement({
      point: {
        ...this._state.point,
        type: newType,
        offers: []
      },
      offers: newOffers,
      checkedOffers: [],
      isTypeListOpen: false
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const destinationName = evt.target.value;
    const newDestination = this.#allDestinations.find(dest => dest.name === destinationName);

    if (newDestination) {
      this.updateElement({
        destination: newDestination,
        point: {
          ...this._state.point,
          destination: newDestination.id
        }
      });
    }
  };

  #priceInputHandler = (evt) => {
    const priceValue = parseInt(evt.target.value, 10);
    const validatedPrice = isNaN(priceValue) || priceValue < 0 ? 0 : priceValue;

    this._setState({
      point: {
        ...this._state.point,
        basePrice: validatedPrice
      }
    });
  };

  #priceBlurHandler = (evt) => {
    const priceValue = parseInt(evt.target.value, 10);
    const validatedPrice = isNaN(priceValue) || priceValue < 0 ? 0 : priceValue;

    evt.target.value = validatedPrice;

    this._setState({
      point: {
        ...this._state.point,
        basePrice: validatedPrice
      }
    });
  };

  #offerChangeHandler = (evt) => {
    evt.preventDefault();
    const offerId = evt.target.name.replace('event-offer-', '');
    let updatedOffers = [...this._state.checkedOffers];

    if (evt.target.checked) {
      const offerToAdd = this._state.offers.offers.find(offer => offer.id === offerId);
      if (offerToAdd && !updatedOffers.some(offer => offer.id === offerId)) {
        updatedOffers.push(offerToAdd);
      }
    } else {
      updatedOffers = updatedOffers.filter(offer => offer.id !== offerId);
    }

    this._setState({
      checkedOffers: updatedOffers,
      point: {
        ...this._state.point,
        offers: updatedOffers.map(offer => offer.id)
      }
    });
  };

  #outsideClickHandler = (evt) => {
    if (this._state.isTypeListOpen) {
      const typeList = this.element.querySelector('.event__type-list');
      const typeToggle = this.element.querySelector('.event__type-toggle');

      if (typeList && !typeList.contains(evt.target) &&
          typeToggle && !typeToggle.contains(evt.target)) {
        this.updateElement({
          isTypeListOpen: false
        });
      }
    }
  };

  removeElement() {
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }

    document.removeEventListener('click', this.#outsideClickHandler);

    super.removeElement();
  }
}
