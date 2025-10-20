import { mockOffers } from '../mock/offers.js';

export default class OffersModel {
  #offers = [];

  constructor() {
    this.#offers = [...mockOffers];
  }

  getOffers() {
    return this.#offers;
  }

  getOffersByType(type) {
    return this.#offers.find((offer) => offer.type === type) || { offers: [] };
  }

  getOffersById(type, offersIds) {
    const offersByType = this.getOffersByType(type);
    return offersByType.offers.filter((offer) => offersIds.includes(offer.id));
  }
}
