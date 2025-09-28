import './style.css';
import TripPresenter from './presenter/trip-presenter.js';

document.addEventListener('DOMContentLoaded', () => {
  const tripContainer = document.querySelector('.page-body');

  if (tripContainer) {
    const tripPresenter = new TripPresenter(tripContainer);
    tripPresenter.init();
  }
});
