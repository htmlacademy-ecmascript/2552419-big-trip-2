import { mockPoints } from '../mock/points.js';
import { mockOffers } from '../mock/offers.js';
import { mockDestinations } from '../mock/destinations.js';

export default class PointsModel {
  #points = mockPoints;
  #offers = mockOffers;
  #destinations = mockDestinations;

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }

  getPoints() {
    return this.#points;
  }

  getOffers() {
    return this.#offers;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffersByType(type) {
    const allOffers = this.getOffers();
    return allOffers.find((offer) => offer.type === type) || { offers: [] };
  }

  getOffersById(type, offersIds) {
    const offersByType = this.getOffersByType(type);
    return offersByType.offers.filter((offer) => offersIds.includes(offer.id));
  }

  getDestinationById(id) {
    const allDestinations = this.getDestinations();
    return allDestinations.find((destination) => destination.id === id);
  }
}
