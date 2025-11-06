import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {
  #points = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return this.#points;
  }

  init = async () => {
    const points = await this.#apiService.getPoints();
    this.#points = points.map(this.#adaptToClient);
  };

  updatePoint = async (updateType, update) => {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    const response = await this.#apiService.updatePoint(update);
    const updatedPoint = this.#adaptToClient(response);
    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1)
    ];
    this._notify(updateType, updatedPoint);
  };

  addPoint = async (updateType, update) => {
    const response = await this.#apiService.addPoint(update);
    const newPoint = this.#adaptToClient(response);
    this.#points = [newPoint, ...this.#points];
    this._notify(updateType, newPoint);
  };

  deletePoint = async (updateType, update) => {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    await this.#apiService.deletePoint(update.id);
    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1)
    ];
    this._notify(updateType);
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
