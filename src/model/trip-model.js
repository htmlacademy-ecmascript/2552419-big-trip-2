import Observable from '../framework/observable.js';
import PointsModel from './points-model.js';
import OffersModel from './offers-model.js';
import DestinationsModel from './destinations-model.js';

export default class TripModel extends Observable {
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;

  constructor(apiService) {
    super();
    this.#pointsModel = new PointsModel(apiService);
    this.#offersModel = new OffersModel(apiService);
    this.#destinationsModel = new DestinationsModel(apiService);

    this.#pointsModel.addObserver(this.#handlePointsModelChange);
  }

  get points() {
    return this.#pointsModel.points;
  }

  get offers() {
    return this.#offersModel.offers;
  }

  get destinations() {
    return this.#destinationsModel.destinations;
  }

  init = async () => {
    try {
      await Promise.all([
        this.#pointsModel.init(),
        this.#offersModel.init(),
        this.#destinationsModel.init()
      ]);
      this._notify('INIT');
    } catch (err) {
      this._notify('INIT', { error: err });
    }
  };

  addPoint = async (updateType, update) => {
    await this.#pointsModel.addPoint(updateType, update);
  };

  updatePoint = async (updateType, update) => {
    await this.#pointsModel.updatePoint(updateType, update);
  };

  deletePoint = async (updateType, update) => {
    await this.#pointsModel.deletePoint(updateType, update);
  };

  getOffersByType = (type) => {
    return this.#offersModel.getOffersByType(type);
  };

  getOffersById = (type, offersIds) => {
    return this.#offersModel.getOffersById(type, offersIds);
  };

  getDestinationById = (id) => {
    return this.#destinationsModel.getDestinationById(id);
  };

  getDestinationByName = (name) => {
    return this.#destinationsModel.getDestinationByName(name);
  };

  calculateTotalCost = () => {
    return this.points.reduce((total, point) => {
      const pointOffers = this.getOffersById(point.type, point.offers);
      const offersCost = pointOffers.reduce((sum, offer) => sum + offer.price, 0);
      return total + point.basePrice + offersCost;
    }, 0);
  };

  #handlePointsModelChange = (updateType, data) => {
    this._notify(updateType, data);
  };
}