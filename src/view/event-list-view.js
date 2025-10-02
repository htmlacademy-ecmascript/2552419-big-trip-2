import AbstractView from './abstract-view.js';

const createEventListTemplate = () => `
  <ul class="trip-events__list"></ul>
`;

class EventListView extends AbstractView {
  get template() {
    return createEventListTemplate();
  }
}

export default EventListView;
