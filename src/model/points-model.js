import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {
  #points = [];
  #apiService = null;
  #isInitialized = false;
  #initializationError = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return this.#points;
  }

  get isInitialized() {
    return this.#isInitialized;
  }

  get hasError() {
    return this.#initializationError !== null;
  }

  init = async () => {
    try {
      const points = await this.#apiService.getPoints();
      this.#points = points.map(this.#adaptToClient);
      this.#isInitialized = true;
      this.#initializationError = null;
      return this.#points;
    } catch (error) {
      this.#isInitialized = false;
      this.#initializationError = error;
      throw error;
    }
  };

  updatePoint = async (updateType, update) => {
    if (this.hasError) {
      throw new Error('Cannot update point: model has initialization error');
    }

    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update non-existent point');
    }

    try {
      const response = await this.#apiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);
      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1)
      ];
      this._notify(updateType, updatedPoint);
    } catch (error) {
      throw new Error('Can\'t update point: ' + error.message);
    }
  };

  addPoint = async (updateType, update) => {
    if (this.hasError) {
      throw new Error('Cannot add point: model has initialization error');
    }

    try {
      const response = await this.#apiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch (error) {
      throw new Error('Can\'t add point: ' + error.message);
    }
  };

  deletePoint = async (updateType, update) => {
    if (this.hasError) {
      throw new Error('Cannot delete point: model has initialization error');
    }

    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete non-existent point');
    }

    try {
      await this.#apiService.deletePoint(update.id);
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1)
      ];
      this._notify(updateType);
    } catch (error) {
      throw new Error('Can\'t delete point: ' + error.message);
    }
  };

  #adaptToClient = (point) => {
    const adaptedPoint = {
      ...point,
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      basePrice: point['base_price'],
      isFavorite: point['is_favorite']
    };

    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['base_price'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  };
}
