import Event from '../model/event.js';
import Destination from '../model/destination.js';
import Offer from '../model/offer.js';

const EVENT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const DESTINATIONS = [
  new Destination(
    '1',
    'Amsterdam',
    'Amsterdam is a beautiful city known for its canals, cycling culture, and historic architecture.',
    [
      { src: 'img/photos/1.jpg', description: 'Amsterdam canal view' },
      { src: 'img/photos/2.jpg', description: 'Amsterdam architecture' }
    ]
  ),
  new Destination(
    '2',
    'Geneva',
    'Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva). Surrounded by the Alps and Jura mountains, the city has views of dramatic Mont Blanc.',
    [
      { src: 'https://picsum.photos/248/152?random=3', description: 'Geneva lake view' },
      { src: 'https://picsum.photos/248/152?random=4', description: 'Geneva mountains' }
    ]
  ),
  new Destination(
    '3',
    'Chamonix',
    'Chamonix-Mont-Blanc (usually shortened to Chamonix) is a resort area near the junction of France, Switzerland and Italy. At the base of Mont Blanc, the highest summit in the Alps, it is renowned for its skiing.',
    [
      { src: 'https://picsum.photos/248/152?random=5', description: 'Chamonix skiing' },
      { src: 'https://picsum.photos/248/152?random=6', description: 'Mont Blanc view' }
    ]
  )
];

const OFFERS = {
  taxi: [
    new Offer('taxi-1', 'Order Uber', 20),
    new Offer('taxi-2', 'Business class', 40)
  ],
  bus: [
    new Offer('bus-1', 'Extra luggage', 15),
    new Offer('bus-2', 'Comfort seat', 25)
  ],
  train: [
    new Offer('train-1', 'First class', 80),
    new Offer('train-2', 'Meal included', 30)
  ],
  ship: [
    new Offer('ship-1', 'Cabin upgrade', 120),
    new Offer('ship-2', 'All inclusive', 200)
  ],
  drive: [
    new Offer('drive-1', 'Rent a car', 200),
    new Offer('drive-2', 'Extra insurance', 50)
  ],
  flight: [
    new Offer('flight-1', 'Add luggage', 50),
    new Offer('flight-2', 'Switch to comfort', 80),
    new Offer('flight-3', 'Add meal', 15),
    new Offer('flight-4', 'Choose seats', 5),
    new Offer('flight-5', 'Travel by train', 40)
  ],
  'check-in': [
    new Offer('check-in-1', 'Add breakfast', 50),
    new Offer('check-in-2', 'Late checkout', 30)
  ],
  sightseeing: [
    new Offer('sightseeing-1', 'Book tickets', 40),
    new Offer('sightseeing-2', 'Lunch in city', 30)
  ],
  restaurant: [
    new Offer('restaurant-1', 'Wine tasting', 60),
    new Offer('restaurant-2', 'Dessert menu', 20)
  ]
};

const EVENTS = [
  new Event(
    '1',
    'taxi',
    DESTINATIONS[0],
    new Date('2019-03-18T10:30:00'),
    new Date('2019-03-18T11:00:00'),
    20,
    [OFFERS.taxi[0]],
    true
  ),
  new Event(
    '2',
    'flight',
    DESTINATIONS[2],
    new Date('2019-03-18T12:25:00'),
    new Date('2019-03-18T13:35:00'),
    160,
    [OFFERS.flight[0], OFFERS.flight[1]],
    false
  ),
  new Event(
    '3',
    'drive',
    DESTINATIONS[2],
    new Date('2019-03-18T14:30:00'),
    new Date('2019-03-18T16:05:00'),
    160,
    [OFFERS.drive[0]],
    true
  )
];

export { EVENT_TYPES, DESTINATIONS, OFFERS, EVENTS };
