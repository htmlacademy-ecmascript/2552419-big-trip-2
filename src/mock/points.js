import { mockOffers } from './offers.js';
import { mockDestinations } from './destinations.js';

const mockPoints = [
  {
    id: '1',
    basePrice: 20,
    dateFrom: '2019-03-18T10:30:00.000Z',
    dateTo: '2019-03-18T11:00:00.000Z',
    destination: mockDestinations[0].id,
    isFavorite: true,
    type: 'taxi',
    offers: [mockOffers.find(o => o.type === 'taxi').offers[0].id]
  },
  {
    id: '2',
    basePrice: 160,
    dateFrom: '2019-03-18T12:25:00.000Z',
    dateTo: '2019-03-18T13:35:00.000Z',
    destination: mockDestinations[2].id,
    isFavorite: false,
    type: 'flight',
    offers: [
      mockOffers.find(o => o.type === 'flight').offers[0].id,
      mockOffers.find(o => o.type === 'flight').offers[1].id
    ]
  },
  {
    id: '3',
    basePrice: 160,
    dateFrom: '2019-03-18T14:30:00.000Z',
    dateTo: '2019-03-18T16:05:00.000Z',
    destination: mockDestinations[2].id,
    isFavorite: true,
    type: 'drive',
    offers: [mockOffers.find(o => o.type === 'drive').offers[0].id]
  }
];

const getRandomPoint = () => mockPoints[Math.floor(Math.random() * mockPoints.length)];

export { mockPoints, getRandomPoint };