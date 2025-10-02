import '../markup/css/style.css';
import TripPresenter from './presenter/trip-presenter.js';

const tripContainer = document.querySelector('.page-body');
const tripPresenter = new TripPresenter({ container: tripContainer });

tripPresenter.init();
