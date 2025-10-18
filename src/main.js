import Presenter from './presenter/presenter.js';
import PointsModel from './model/point-model.js';


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

  const pointsModel = new PointsModel();
  const presenter = new Presenter(
    tripEventsContainer,
    tripInfoContainer,
    actualFiltersContainer,
    pointsModel
  );

  presenter.init();
});
