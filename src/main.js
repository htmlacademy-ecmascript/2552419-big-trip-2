import { render } from './framework/render.js';
import FiltersView from './view/filters-view.js';
import Presenter from './presenter/presenter.js';
import PointsModel from './model/point-model.js';

const filtersContainer = document.querySelector('.trip-controls__filters');
render(new FiltersView(), filtersContainer);

const tripEventsContainer = document.querySelector('.trip-events');
const pointsModel = new PointsModel();
const presenter = new Presenter(tripEventsContainer, pointsModel);

presenter.init();
