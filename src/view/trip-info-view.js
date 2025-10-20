import AbstractView from '../framework/view/abstract-view.js';
import { huminazeDate } from '../util.js';

const createTripInfoTemplate = (points, destinations, totalCost) => {
  if (!points || points.length === 0) {
    return `
      <section class="trip-main__trip-info trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">No points yet</h1>
          <p class="trip-info__dates"></p>
        </div>
        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">0</span>
        </p>
      </section>
    `;
  }


  const routeDestinations = [];
  points.forEach(point => {
    const destination = destinations.find(dest => dest.id === point.destination);
    if (destination && !routeDestinations.includes(destination.name)) {
      routeDestinations.push(destination.name);
    }
  });


  let routeTitle = routeDestinations.join(' — ');
  if (routeDestinations.length > 3) {
    routeTitle = `${routeDestinations[0]} — ... — ${routeDestinations[routeDestinations.length - 1]}`;
  }


  const sortedPoints = points.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
  const startDate = sortedPoints[0].dateFrom;
  const endDate = sortedPoints[sortedPoints.length - 1].dateTo;

  const startDateFormatted = huminazeDate(startDate, 'MMM DD');
  const endDateFormatted = huminazeDate(endDate, 'MMM DD');

  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${routeTitle}</h1>
        <p class="trip-info__dates">${startDateFormatted}&nbsp;&mdash;&nbsp;${endDateFormatted}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>
  `;
};

export default class TripInfoView extends AbstractView {
  #points = null;
  #destinations = null;
  #totalCost = 0;

  constructor({ points, destinations, totalCost }) {
    super();
    this.#points = points;
    this.#destinations = destinations;
    this.#totalCost = totalCost;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#destinations, this.#totalCost);
  }
}