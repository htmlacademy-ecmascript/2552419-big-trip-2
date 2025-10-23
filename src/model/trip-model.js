import PointsModel from './points-model.js';
import OffersModel from './offers-model.js';
import DestinationsModel from './destinations-model.js';

export default class TripModel {
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;

  constructor() {
    this.#pointsModel = new PointsModel();
    this.#offersModel = new OffersModel();
    this.#destinationsModel = new DestinationsModel();
  }


  getPoints() {
    return this.#pointsModel.getPoints();
  }

  deletePoint(pointId) {
    return this.#pointsModel.deletePoint(pointId);
  }

  updatePoint(updatedPoint) {
    return this.#pointsModel.updatePoint(updatedPoint);
  }

  addPoint(newPoint) {
    return this.#pointsModel.addPoint(newPoint);
  }


  getOffers() {
    return this.#offersModel.getOffers();
  }

  getOffersByType(type) {
    return this.#offersModel.getOffersByType(type);
  }

  getOffersById(type, offersIds) {
    return this.#offersModel.getOffersById(type, offersIds);
  }


  getDestinations() {
    return this.#destinationsModel.getDestinations();
  }

  getDestinationById(id) {
    return this.#destinationsModel.getDestinationById(id);
  }

  getDestinationByName(name) {
    return this.#destinationsModel.getDestinationByName(name);
  }


  calculateTotalCost() {
    return this.getPoints().reduce((total, point) => {
      const pointOffers = this.getOffersById(point.type, point.offers);
      const offersCost = pointOffers.reduce((sum, offer) => sum + offer.price, 0);
      return total + point.basePrice + offersCost;
    }, 0);
  }
}