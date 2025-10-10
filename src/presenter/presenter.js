import { render, replace } from '../framework/render.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import PointView from '../view/point-view.js';
import PointEditFormView from '../view/point-edit-form-view.js';

export default class Presenter {
  #sortingComponent = new SortingView();
  #pointsListComponent = new PointsListView();
  #container = null;
  #pointsModel = null;
  #points = [];

  constructor(container, pointsModel) {
    this.#container = container;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#points = [...this.#pointsModel.getPoints()];

    render(this.#sortingComponent, this.#container);
    render(this.#pointsListComponent, this.#container);

    const pointsListElement = this.#pointsListComponent.element;

    this.#points.forEach((point) => {
      this.#renderPoint(point, pointsListElement);
    });
  }

  #renderPoint(point, container) {
    const pointComponent = new PointView({
      point: point,
      offers: this.#pointsModel.getOffersById(point.type, point.offers),
      destination: this.#pointsModel.getDestinationById(point.destination),
      onEditClick: () => {
        this.#replacePointToForm(pointComponent, point);
      }
    });

    const pointEditComponent = new PointEditFormView({
      point: point,
      offers: this.#pointsModel.getOffersByType(point.type),
      checkedOffers: this.#pointsModel.getOffersById(point.type, point.offers),
      destination: this.#pointsModel.getDestinationById(point.destination),
      isNew: false,
      onSubmit: () => {
        this.#replaceFormToPoint(pointEditComponent, point);
      },
      onClose: () => {
        this.#replaceFormToPoint(pointEditComponent, point);
      }
    });

    render(pointComponent, container);
  }

  #replacePointToForm(pointComponent, point) {
    const pointEditComponent = new PointEditFormView({
      point: point,
      offers: this.#pointsModel.getOffersByType(point.type),
      checkedOffers: this.#pointsModel.getOffersById(point.type, point.offers),
      destination: this.#pointsModel.getDestinationById(point.destination),
      isNew: false,
      onSubmit: () => {
        this.#replaceFormToPoint(pointEditComponent, point);
      },
      onClose: () => {
        this.#replaceFormToPoint(pointEditComponent, point);
      }
    });

    replace(pointEditComponent, pointComponent);
  }

  #replaceFormToPoint(pointEditComponent, point) {
    const pointComponent = new PointView({
      point: point,
      offers: this.#pointsModel.getOffersById(point.type, point.offers),
      destination: this.#pointsModel.getDestinationById(point.destination),
      onEditClick: () => {
        this.#replacePointToForm(pointComponent, point);
      }
    });

    replace(pointComponent, pointEditComponent);
  }
}
