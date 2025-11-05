import ApiService from './api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
};

export default class TaskApiService extends ApiService {
  async getPoints() {
    return this._load({ url: 'points' })
      .then(ApiService.parseResponse);
  }

  async getDestinations() {
    return this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  async getOffers() {
    return this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' })
    })
      .then(ApiService.parseResponse);
  }

  async addPoint(point) {
    return this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' })
    })
      .then(ApiService.parseResponse);
  }

  async deletePoint(pointId) {
    return this._load({
      url: `points/${pointId}`,
      method: Method.DELETE
    });
  }

  #adaptToServer(point) {
    const adaptedPoint = {
      ...point,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'base_price': Number(point.basePrice),
      'is_favorite': point.isFavorite
    };


    if (adaptedPoint.id === null) {
      delete adaptedPoint.id;
    }

    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.basePrice;
    delete adaptedPoint.isFavorite;

    return adaptedPoint;
  }
}