
import { mockOffers } from './offers.js';
import { mockDestinations } from './destinations.js';
import { getRandomInteger, getRandomArrElem } from '../util.js';
import { POINT_TYPES } from '../const.js';

const generateRandomPoint = (id) => {
  const type = getRandomArrElem(POINT_TYPES);
  const destination = getRandomArrElem(mockDestinations);
  const basePrice = getRandomInteger(20, 500);

  const baseDate = new Date();
  const dateFrom = new Date(baseDate.getTime() + getRandomInteger(0, 7) * 24 * 60 * 60 * 1000);
  const dateTo = new Date(dateFrom.getTime() + getRandomInteger(1, 12) * 60 * 60 * 1000);

  const typeOffers = mockOffers.find(o => o.type === type)?.offers || [];
  const offers = typeOffers
    .slice(0, getRandomInteger(0, 3))
    .map(offer => offer.id);

  return {
    id: id.toString(),
    basePrice,
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    destination: destination.id,
    isFavorite: Math.random() > 0.7,
    type,
    offers
  };
};


const mockPoints = Array.from({ length: 15 }, (_, i) => generateRandomPoint(i + 1));

export { mockPoints };