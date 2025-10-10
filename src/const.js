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

const OffersMap = new Map([
  ['Order Uber', 'uber'],
  ['Business class', 'business'],
  ['Extra luggage', 'luggage'],
  ['Comfort seat', 'comfort'],
  ['First class', 'first'],
  ['Meal included', 'meal'],
  ['Cabin upgrade', 'cabin'],
  ['All inclusive', 'all'],
  ['Rent a car', 'car'],
  ['Extra insurance', 'insurance'],
  ['Add luggage', 'luggage'],
  ['Switch to comfort', 'comfort'],
  ['Add meal', 'meal'],
  ['Choose seats', 'seats'],
  ['Travel by train', 'train'],
  ['Add breakfast', 'breakfast'],
  ['Late checkout', 'checkout'],
  ['Book tickets', 'tickets'],
  ['Lunch in city', 'lunch'],
  ['Wine tasting', 'wine'],
  ['Dessert menu', 'dessert']
]);

export { POINT_TYPES, POINT_DESTINATIONS, POINT_OFFERS, POINT_DESCRIPTIONS, OffersMap };
