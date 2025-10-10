import { POINT_TYPES, POINT_OFFERS } from '../const.js';
import { getRandomInteger } from '../util.js';

const mockOffers = POINT_TYPES.map((type, i) => ({
  type: type,
  offers: Array.from({ length: getRandomInteger(2, 5) }, (v, n) => {
    const offerIndex = (i * 3 + n) % POINT_OFFERS.length;
    return {
      id: `${type}-${n + 1}`,
      title: POINT_OFFERS[offerIndex],
      price: getRandomInteger(5, 200),
    };
  })
}));

export { mockOffers };
