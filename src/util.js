import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const DateMap = new Map([
  ['MonthDay', 'MMM D'],
  ['DayMonthYear', 'DD/MM/YY'],
  ['HoursMinutes', 'HH:mm'],
  ['DateTime', 'DD/MM/YY HH:mm']
]);

const huminazeDate = (date, format) => date ? dayjs(date).utc().format(format) : '';

const getDateDifference = (start, end) => {
  const diff = new Date(end) - new Date(start);
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const totalMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (totalDays > 0) {
    return `${totalDays}D ${totalHours}H ${totalMinutes}M`;
  }

  if (totalHours > 0) {
    return `${totalHours}H ${totalMinutes}M`;
  }
  return `${totalMinutes}M`;
};

const getRandomInteger = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));

const getRandomArrElem = (array) => array[Math.floor(Math.random() * array.length)];

export { getRandomArrElem, getRandomInteger, DateMap, getDateDifference, huminazeDate };