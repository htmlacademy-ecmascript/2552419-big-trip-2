
import { mockPoints } from '../mock/points.js';
import { mockOffers } from '../mock/offers.js';
import { mockDestinations } from '../mock/destinations.js';

export default class PointsModel {
  #points = [];
  #offers = [];
  #destinations = [];

  constructor() {
    this.#points = [...mockPoints];
    this.#offers = [...mockOffers];
    this.#destinations = [...mockDestinations];
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
    return this.#offers.find((offer) => offer.type === type) || { offers: [] };
  }

  getOffersById(type, offersIds) {
    const offersByType = this.getOffersByType(type);
    return offersByType.offers.filter((offer) => offersIds.includes(offer.id));
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  calculateTotalCost() {
    return this.#points.reduce((total, point) => {
      const pointOffers = this.getOffersById(point.type, point.offers);
      const offersCost = pointOffers.reduce((sum, offer) => sum + offer.price, 0);
      return total + point.basePrice + offersCost;
    }, 0);
  }

  deletePoint(pointId) {
    this.#points = this.#points.filter(point => point.id !== pointId);
    return this.#points;
  }
}
