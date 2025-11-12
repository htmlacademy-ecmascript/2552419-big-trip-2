import AbstractView from '../framework/view/abstract-view.js';

const createEmptyListTemplate = (filterType = 'everything') => {
  const messages = {
    everything: 'Click New Event to create your first point',
    future: 'There are no future events now',
    present: 'There are no present events now',
    past: 'There are no past events now'
  };

  return `
    <p class="trip-events__msg">${messages[filterType]}</p>
  `;
};

export default class EmptyListView extends AbstractView {
  #filterType = 'everything';

  constructor(filterType = 'everything') {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createEmptyListTemplate(this.#filterType);
  }
}
