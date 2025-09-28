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

    for (let i = 0; i < 3; i++) {
      const eventItemView = new EventItemView();
      render(eventItemView, eventListElement);
    }
  }
}
