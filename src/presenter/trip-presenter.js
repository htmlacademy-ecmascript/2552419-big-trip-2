import HeaderView from '../view/header-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EventItemView from '../view/event-item-view.js';
import EventEditView from '../view/event-edit-view.js';
import { render } from '../render.js';

export default class TripPresenter {
  constructor(container) {
    this.container = container;
  }

  init() {
    this.renderHeader();
    this.renderTripEvents();
  }

  renderHeader() {
    const headerView = new HeaderView();
    render(headerView, this.container);

    const tripMainElement = this.container.querySelector('.trip-main');

    const tripInfoView = new TripInfoView();
    render(tripInfoView, tripMainElement);

    const filterView = new FilterView();
    render(filterView, tripMainElement);
  }

  renderTripEvents() {
    const mainElement = this.container.querySelector('.page-main .page-body__container');

    const sortView = new SortView();
    render(sortView, mainElement);

    const eventListView = new EventListView();
    render(eventListView, mainElement);

    const eventListElement = mainElement.querySelector('.trip-events__list');

    const eventEditView = new EventEditView();
    render(eventEditView, eventListElement);

    const eventData = [
      {
        date: '2019-03-18',
        displayDate: 'MAR 18',
        type: 'taxi',
        typeIcon: 'taxi.png',
        title: 'Taxi Amsterdam',
        startTime: '2019-03-18T10:30',
        displayStartTime: '10:30',
        endTime: '2019-03-18T11:00',
        displayEndTime: '11:00',
        duration: '30M',
        price: 20,
        offers: [
          { title: 'Order Uber', price: 20 }
        ],
        isFavorite: true
      },
      {
        date: '2019-03-18',
        displayDate: 'MAR 18',
        type: 'flight',
        typeIcon: 'flight.png',
        title: 'Flight Chamonix',
        startTime: '2019-03-18T12:25',
        displayStartTime: '12:25',
        endTime: '2019-03-18T13:35',
        displayEndTime: '13:35',
        duration: '01H 10M',
        price: 160,
        offers: [
          { title: 'Add luggage', price: 50 },
          { title: 'Switch to comfort', price: 80 }
        ],
        isFavorite: false
      },
      {
        date: '2019-03-18',
        displayDate: 'MAR 18',
        type: 'drive',
        typeIcon: 'drive.png',
        title: 'Drive Chamonix',
        startTime: '2019-03-18T14:30',
        displayStartTime: '14:30',
        endTime: '2019-03-18T16:05',
        displayEndTime: '16:05',
        duration: '01H 35M',
        price: 160,
        offers: [
          { title: 'Rent a car', price: 200 }
        ],
        isFavorite: true
      }
    ];

    eventData.forEach((event) => {
      const eventItemView = new EventItemView(event);
      render(eventItemView, eventListElement);
    });
  }
}
