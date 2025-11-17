const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offer'
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT'
};

const LOWER_LIMIT = 350;
const UPPER_LIMIT = 1000;
const DEFAULT_BASE_PRICE = 0;
const MIN_PRICE = 0;
const PAD_LENGTH = 2;
const PAD_CHAR = '0';
const NOT_FOUND_INDEX = -1;
const DEFAULT_TOTAL_COST = 0;

export {
  POINT_TYPES,
  SortType,
  UserAction,
  UpdateType,
  LOWER_LIMIT,
  UPPER_LIMIT,
  DEFAULT_BASE_PRICE,
  MIN_PRICE,
  PAD_LENGTH,
  PAD_CHAR,
  NOT_FOUND_INDEX,
  DEFAULT_TOTAL_COST
};
