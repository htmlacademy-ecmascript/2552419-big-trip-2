import Point from '../model/point.js';
import Destination from '../model/destination.js';
import { OfferGroup } from '../model/offer.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

const AUTHORIZATION = 'Basic er883jdzbdw';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

export default class ApiService {
  constructor() {
    this._authorization = AUTHORIZATION;
  }

  getPoints() {
    return this._load({url: 'points'})
      .then(ApiService.parseResponse)
      .then(Point.parsePoints);
  }

  getDestinations() {
    return this._load({url: 'destinations'})
      .then(ApiService.parseResponse)
      .then(Destination.parseDestinations);
  }

  getOffers() {
    return this._load({url: 'offers'})
      .then(ApiService.parseResponse)
      .then(OfferGroup.parseOfferGroups);
  }

  updatePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(point.toRAW()),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(ApiService.parseResponse)
      .then(Point.parsePoint);
  }

  addPoint(point) {
    return this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(point.toRAW()),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(ApiService.parseResponse)
      .then(Point.parsePoint);
  }

  deletePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: Method.DELETE,
    });
  }

  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers(),
  }) {
    headers.append('Authorization', this._authorization);

    return fetch(
      `${END_POINT}/${url}`,
      {method, body, headers},
    )
      .then(ApiService.checkStatus)
      .catch(ApiService.catchError);
  }

  static checkStatus(response) {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static parseResponse(response) {
    return response.json();
  }

  static catchError(err) {
    throw err;
  }
}
