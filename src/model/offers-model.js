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
    this.#offers = await this.#apiService.getOffers();
  };

  getOffersByType = (type) => {
    return this.#offers.find((offer) => offer.type === type) || { offers: [] };
  };

  getOffersById = (type, offersIds) => {
    const offersByType = this.getOffersByType(type);
    return offersByType.offers.filter((offer) => offersIds.includes(offer.id));
  };
}
