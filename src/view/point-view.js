import AbstractView from './abstract-view.js';
import { DateMap, getDateDifference, huminazeDate } from '../util.js';

const createPointTemplate = (point, offers, destination) => {
  const { basePrice, isFavorite, type, dateFrom, dateTo } = point;

  const favoritePoint = isFavorite ? 'event__favorite-btn--active' : '';

  const hasOffers = offers.length
    ? `
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        ${offers.map((offer) =>
          `<li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>`).join('')}
      </ul>
    `
    : '';

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${dateFrom}">${huminazeDate(dateFrom, DateMap.get('MonthDay'))}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${destination.name}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateFrom}">${huminazeDate(dateFrom, DateMap.get('HoursMinutes'))}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateTo}">${huminazeDate(dateTo, DateMap.get('HoursMinutes'))}</time>
          </p>
          <p class="event__duration">${getDateDifference(dateFrom, dateTo)}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        ${hasOffers}
        <button class="event__favorite-btn ${favoritePoint}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `;
};

export default class PointView extends AbstractView {
  constructor({ point, offers, destination }) {
    super();
    this.point = point;
    this.offers = offers;
    this.destination = destination;
  }

  get template() {
    return createPointTemplate(this.point, this.offers, this.destination);
  }
}
