import Observable from '../framework/observable.js';

export default class DestinationsModel extends Observable {
  #destinations = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get destinations() {
    return this.#destinations;
  }

  init = async () => {
    this.#destinations = await this.#apiService.getDestinations();
  };

  getDestinationById = (id) => {
    return this.#destinations.find((destination) => destination.id === id);
  };

  getDestinationByName = (name) => {
    return this.#destinations.find((destination) => destination.name === name);
  };
}
