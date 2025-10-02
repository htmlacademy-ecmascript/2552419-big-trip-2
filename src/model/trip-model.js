import { EVENTS, DESTINATIONS, OFFERS, EVENT_TYPES } from '../mock/mock.js';

export default class TripModel {
  #events = EVENTS;
  #destinations = DESTINATIONS;
  #offers = OFFERS;
  #eventTypes = EVENT_TYPES;

  get events() {
    return this.#events;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  get eventTypes() {
    return this.#eventTypes;
  }

  getOffersByType(type) {
    return this.#offers[type] || [];
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }
}
