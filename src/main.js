import Presenter from './presenter/presenter.js';
import TripModel from './model/trip-model.js';
import TaskApiService from './framework/task-api-service.js';

const AUTHORIZATION = 'Basic eo0w590ik29889a';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

document.addEventListener('DOMContentLoaded', () => {
  const tripEventsContainer = document.querySelector('.trip-events');
  const tripMainContainer = document.querySelector('.trip-main');
  const filtersContainer = document.querySelector('.trip-controls__filters');

  if (!tripEventsContainer) {
    return;
  }

  if (!tripMainContainer) {
    return;
  }

  let tripInfoContainer = document.querySelector('.trip-main__trip-info');
  if (!tripInfoContainer) {
    tripInfoContainer = document.createElement('div');
    tripInfoContainer.className = 'trip-main__trip-info trip-info';
    tripMainContainer.insertBefore(tripInfoContainer, tripMainContainer.firstChild);
  }

  let actualFiltersContainer = filtersContainer;
  if (!actualFiltersContainer) {
    const tripControls = document.querySelector('.trip-controls');
    if (tripControls) {
      actualFiltersContainer = document.createElement('div');
      actualFiltersContainer.className = 'trip-controls__filters';
      tripControls.appendChild(actualFiltersContainer);
    }
  }

  const apiService = new TaskApiService(END_POINT, AUTHORIZATION);
  const tripModel = new TripModel(apiService);
  const presenter = new Presenter(
    tripEventsContainer,
    tripInfoContainer,
    actualFiltersContainer,
    tripModel
  );

  presenter.init();

  const newEventButton = document.querySelector('.trip-main__event-add-btn');
  if (newEventButton) {
    newEventButton.disabled = false;
    newEventButton.addEventListener('click', () => {
      presenter.createNewPoint();
    });
  }
});
