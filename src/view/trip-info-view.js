import AbstractView from '../framework/view/abstract-view.js';
import { humanizeDate } from '../util.js';
import he from 'he';

const createTripInfoTemplate = (points, destinations, totalCost) => {
  if (!points || points.length === 0) {
    return '';
  }

  const sortedPoints = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

  const routeDestinations = [];
  const destinationMap = new Map();

  destinations.forEach(dest => {
    destinationMap.set(dest.id, dest);
  });

  let lastDestination = null;
  sortedPoints.forEach(point => {
    const destination = destinationMap.get(point.destination);
    if (destination && destination.name !== lastDestination) {
      routeDestinations.push(destination.name);
      lastDestination = destination.name;
    }
  });

  let routeTitle;
  if (routeDestinations.length === 0) {
    routeTitle = '';
  } else if (routeDestinations.length <= 3) {
    routeTitle = routeDestinations.map(dest => he.encode(dest)).join(' — ');
  } else {
    routeTitle = `${he.encode(routeDestinations[0])} — ... — ${he.encode(routeDestinations[routeDestinations.length - 1])}`;
  }

  const startDate = sortedPoints[0].dateFrom;
  const endDate = sortedPoints[sortedPoints.length - 1].dateTo;

  const startDay = humanizeDate(startDate, 'D');
  const endDay = humanizeDate(endDate, 'D');
  const startMonth = humanizeDate(startDate, 'MMM').toUpperCase();
  const endMonth = humanizeDate(endDate, 'MMM').toUpperCase();

  let datesText;
  if (startMonth === endMonth) {
    datesText = `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  } else {
    datesText = `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
  }

  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${routeTitle}</h1>
        <p class="trip-info__dates">${datesText}</p>
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

  removeElement() {
    super.removeElement();
  }
}
