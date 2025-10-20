import { mockDestinations } from '../mock/destinations.js';

export default class DestinationsModel {
  #destinations = [];

  constructor() {
    this.#destinations = [...mockDestinations];
  }

  getDestinations() {
    return this.#destinations;
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  getDestinationByName(name) {
    return this.#destinations.find((destination) => destination.name === name);
  }
}