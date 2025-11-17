import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import { SortType } from './const.js';

dayjs.extend(utc);
dayjs.extend(duration);

const DateMap = new Map([
  ['MonthDay', 'MMM D'],
  ['DayMonthYear', 'DD/MM/YY'],
  ['HoursMinutes', 'HH:mm'],
  ['DateTime', 'DD/MM/YY HH:mm'],
  ['DayMonth', 'DD MMM']
]);

const humanizeDate = (date, format) => {
  if (!date) {
    return '';
  }

  const dateObj = dayjs(date);
  let formatted = dateObj.format(format);

  if (format === 'DD MMM') {
    formatted = formatted.toUpperCase();
  }

  return formatted;
};

const getDateDifference = (start, end) => {
  if (!start || !end) {
    return '';
  }

  const diff = dayjs(end).diff(dayjs(start));
  const durationObj = dayjs.duration(diff);

  const days = Math.floor(durationObj.asDays());
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  const formatNumber = (num) => num.toString().padStart(2, '0');

  if (days > 0) {
    return `${formatNumber(days)}D ${formatNumber(hours)}H ${formatNumber(minutes)}M`;
  }

  if (hours > 0) {
    return `${formatNumber(hours)}H ${formatNumber(minutes)}M`;
  }

  return `${formatNumber(minutes)}M`;
};

const isEscapeKey = (evt) => evt.key === 'Escape' || evt.key === 'Esc';

const sortPointsByDay = (pointA, pointB) =>
  dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

const sortPointsByTime = (pointA, pointB) => {
  const durationA = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));
  const durationB = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom));
  return durationB - durationA;
};

const sortPointsByPrice = (pointA, pointB) =>
  pointB.basePrice - pointA.basePrice;

const sortPoints = (points, sortType) => {
  const sortedPoints = [...points];

  switch (sortType) {
    case SortType.TIME:
      return sortedPoints.sort(sortPointsByTime);
    case SortType.PRICE:
      return sortedPoints.sort(sortPointsByPrice);
    case SortType.DAY:
    default:
      return sortedPoints.sort(sortPointsByDay);
  }
};

const filterPoints = {
  everything: (points) => points,
  future: (points) => points.filter(point => new Date(point.dateFrom) > new Date()),
  present: (points) => points.filter(point =>
    new Date(point.dateFrom) <= new Date() && new Date(point.dateTo) >= new Date()
  ),
  past: (points) => points.filter(point => new Date(point.dateTo) < new Date())
};

const getFiltersData = (points) => {
  const everythingCount = filterPoints.everything(points).length;
  const futureCount = filterPoints.future(points).length;
  const presentCount = filterPoints.present(points).length;
  const pastCount = filterPoints.past(points).length;

  return [
    { type: 'everything', name: 'Everything', count: everythingCount },
    { type: 'future', name: 'Future', count: futureCount },
    { type: 'present', name: 'Present', count: presentCount },
    { type: 'past', name: 'Past', count: pastCount }
  ];
};

export {
  DateMap,
  getDateDifference,
  humanizeDate,
  isEscapeKey,
  filterPoints,
  getFiltersData,
  sortPoints
};
