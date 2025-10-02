import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EventEditView from '../view/event-edit-view.js';
import EventItemView from '../view/event-item-view.js';
import { render } from '../render.js';
import TripModel from '../model/trip-model.js';

class TripPresenter {
  #container = null;
  #model = new TripModel();

  constructor({ container }) {
    this.#container = container;
  }

  init() {
    this.#renderTrip();
  }

  #renderTrip() {
    const tripMainElement = this.#container.querySelector('.trip-main');
    const filterView = new FilterView();
    render(filterView, tripMainElement);

    const tripEventsElement = this.#container.querySelector('.trip-events');
    const sortView = new SortView();
    render(sortView, tripEventsElement);

    const eventListView = new EventListView();
    render(eventListView, tripEventsElement);

    const eventListElement = tripEventsElement.querySelector('.trip-events__list');

    // Рендерим форму создания новой точки маршрута
    const eventEditView = new EventEditView();
    render(eventEditView, eventListElement);

    // Рендерим существующие точки маршрута
    this.#model.events.forEach((event) => {
      const eventItemView = new EventItemView(event);
      render(eventItemView, eventListElement);
    });
  }
}

export default TripPresenter;
