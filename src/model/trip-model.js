import Observable from '../framework/observable.js';
import PointsModel from './points-model.js';
import OffersModel from './offers-model.js';
import DestinationsModel from './destinations-model.js';

export default class TripModel extends Observable {
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #isInitialized = false;
  #initializationError = null;

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

  get isInitialized() {
    return this.#isInitialized;
  }

  get hasError() {
    return this.#initializationError !== null;
  }

  get error() {
    return this.#initializationError;
  }

  init = async () => {
    try {
      await Promise.all([
        this.#pointsModel.init(),
        this.#offersModel.init(),
        this.#destinationsModel.init()
      ]);

      if (this.#pointsModel.hasError) {
        throw new Error('Failed to load points');
      }

      this.#isInitialized = true;
      this.#initializationError = null;
      this._notify('INIT');
    } catch (error) {
      this.#isInitialized = false;
      this.#initializationError = error;
      this._notify('ERROR', error);
    }
  };

  addPoint = async (updateType, update) => {
    if (this.hasError) {
      throw new Error('Cannot add point: model has initialization error');
    }

    try {
      await this.#pointsModel.addPoint(updateType, update);
    } catch (error) {
      throw new Error('Can\'t add point: ' + error.message);
    }
  };

  updatePoint = async (updateType, update) => {
    if (this.hasError) {
      throw new Error('Cannot update point: model has initialization error');
    }

    try {
      await this.#pointsModel.updatePoint(updateType, update);
    } catch (error) {
      throw new Error('Can\'t update point: ' + error.message);
    }
  };

  deletePoint = async (updateType, update) => {
    if (this.hasError) {
      throw new Error('Cannot delete point: model has initialization error');
    }

    try {
      await this.#pointsModel.deletePoint(updateType, update);
    } catch (error) {
      throw new Error('Can\'t delete point: ' + error.message);
    }
  };

  getOffersByType = (type) => {
    if (this.hasError) {
      return { offers: [] };
    }
    return this.#offersModel.getOffersByType(type);
  };

  getOffersById = (type, offersIds) => {
    if (this.hasError) {
      return [];
    }
    return this.#offersModel.getOffersById(type, offersIds);
  };

  getDestinationById = (id) => {
    if (this.hasError) {
      return null;
    }
    return this.#destinationsModel.getDestinationById(id);
  };

  getDestinationByName = (name) => {
    if (this.hasError) {
      return null;
    }
    return this.#destinationsModel.getDestinationByName(name);
  };

  calculateTotalCost = () => {
    if (this.hasError || !this.points) {
      return 0;
    }

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
