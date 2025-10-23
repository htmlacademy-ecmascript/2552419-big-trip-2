
const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const POINT_DESTINATIONS = ['Amsterdam', 'Geneva', 'Chamonix'];

const POINT_OFFERS = [
  'Order Uber', 'Business class', 'Extra luggage', 'Comfort seat',
  'First class', 'Meal included', 'Cabin upgrade', 'All inclusive',
  'Rent a car', 'Extra insurance', 'Add luggage', 'Switch to comfort',
  'Add meal', 'Choose seats', 'Travel by train', 'Add breakfast',
  'Late checkout', 'Book tickets', 'Lunch in city', 'Wine tasting',
  'Dessert menu'
];

const POINT_DESCRIPTIONS = [
  'Amsterdam is a beautiful city known for its canals, cycling culture, and historic architecture.',
  'Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva). Surrounded by the Alps and Jura mountains, the city has views of dramatic Mont Blanc.',
  'Chamonix-Mont-Blanc (usually shortened to Chamonix) is a resort area near the junction of France, Switzerland and Italy. At the base of Mont Blanc, the highest summit in the Alps, it is renowned for its skiing.'
];

const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offer'
};

const SortTypeLabels = {
  [SortType.DAY]: 'Day',
  [SortType.EVENT]: 'Event',
  [SortType.TIME]: 'Time',
  [SortType.PRICE]: 'Price',
  [SortType.OFFER]: 'Offers'
};

const EnabledSortType = {
  [SortType.DAY]: true,
  [SortType.EVENT]: false,
  [SortType.TIME]: true,
  [SortType.PRICE]: true,
  [SortType.OFFER]: false
};

const SortTypeOrder = [
  SortType.DAY,
  SortType.EVENT,
  SortType.TIME,
  SortType.PRICE,
  SortType.OFFER
];

export {
  POINT_TYPES,
  POINT_DESTINATIONS,
  POINT_OFFERS,
  POINT_DESCRIPTIONS,
  SortType,
  SortTypeLabels,
  EnabledSortType,
  SortTypeOrder
};
