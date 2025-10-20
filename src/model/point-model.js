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
    try {
      this.#points = this.#points.filter(point => point.id !== pointId);
      return this.#points;
    } catch (error) {
      console.error('Error deleting point:', error);
      throw error;
    }
  }

  updatePoint(updatedPoint) {
    try {
      const index = this.#points.findIndex(point => point.id === updatedPoint.id);
      if (index !== -1) {
        this.#points[index] = { ...this.#points[index], ...updatedPoint };
      } else {
        console.warn(`Point with id ${updatedPoint.id} not found for update`);
      }
      return this.#points;
    } catch (error) {
      console.error('Error updating point:', error);
      throw error;
    }
  }

  addPoint(newPoint) {
    try {
      this.#points.push(newPoint);
      return this.#points;
    } catch (error) {
      console.error('Error adding point:', error);
      throw error;
    }
  }
}
