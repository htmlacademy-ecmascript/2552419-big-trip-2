import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EventEditView from '../view/event-edit-view.js';
import EventItemView from '../view/event-item-view.js';
import { render } from '../render.js';

class TripPresenter {
  constructor({ container }) {
    this.container = container;
  }

  init() {
    this.renderTrip();
  }

  renderTrip() {
    const tripMainElement = this.container.querySelector('.trip-main');

    // Рендерим фильтры
    const filterView = new FilterView();
    render(filterView, tripMainElement);

    const tripEventsElement = this.container.querySelector('.trip-events');

    // Рендерим сортировку
    const sortView = new SortView();
    render(sortView, tripEventsElement);

    // Рендерим список событий
    const eventListView = new EventListView();
    render(eventListView, tripEventsElement);

    const eventListElement = tripEventsElement.querySelector('.trip-events__list');

    // Рендерим форму редактирования (первой в списке)
    const eventEditView = new EventEditView();
    render(eventEditView, eventListElement);

    // Рендерим 3 точки маршрута
    for (let i = 0; i < 3; i++) {
      const eventItemView = new EventItemView();
      render(eventItemView, eventListElement);
    }
  }
}

export default TripPresenter;
