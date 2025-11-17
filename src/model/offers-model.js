import Observable from '../framework/observable.js';

export default class OffersModel extends Observable {
  #offers = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get offers() {
    return this.#offers;
  }

  init = async () => {
    try {
      this.#offers = await this.#apiService.getOffers();
    } catch (err) {
      this.#offers = [];
      throw new Error('Failed to load offers');
    }
  };

  getOffersByType = (type) => this.#offers.find((offer) => offer.type === type) || { offers: [] };

  getOffersById = (type, offersIds) => {
    const offersByType = this.getOffersByType(type);
    return offersByType.offers.filter((offer) => offersIds.includes(offer.id));
  };
}
