import { POINT_DESTINATIONS, POINT_DESCRIPTIONS } from '../const.js';
import { getRandomArrElem, getRandomInteger } from '../util.js';

const mockDestinations = Array.from({ length: POINT_DESTINATIONS.length }, (_, i) => ({
  id: `${i + 1}`,
  description: POINT_DESCRIPTIONS[i] || getRandomArrElem(POINT_DESCRIPTIONS),
  name: POINT_DESTINATIONS[i],
  pictures: Array.from({ length: getRandomInteger(2, 5) }, (v, n) => ({
    src: `img/photos/${n + 1}.jpg`,
    description: `${POINT_DESTINATIONS[i]} photo ${n + 1}`,
  }))
}));

export { mockDestinations };
