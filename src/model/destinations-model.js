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
    try {
      this.#destinations = await this.#apiService.getDestinations();
    } catch (err) {
      this.#destinations = [];
      throw new Error('Failed to load destinations');
    }
  };

  getDestinationById = (id) => {
    return this.#destinations.find((destination) => destination.id === id);
  };

  getDestinationByName = (name) => {
    return this.#destinations.find((destination) => destination.name === name);
  };
}
