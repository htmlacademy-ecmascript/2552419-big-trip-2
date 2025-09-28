import './style.css';
import TripPresenter from './presenter/trip-presenter.js';

// Временные стили для отладки
const style = document.createElement('style');
style.textContent = `
  .trip-events__item { border: 2px solid red; margin: 5px; padding: 5px; }
  .event--edit { border-color: blue !important; }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  const tripContainer = document.querySelector('.page-body');

  if (tripContainer) {
    const tripPresenter = new TripPresenter(tripContainer);
    tripPresenter.init();
  }
});
