import { render, replace, remove } from '../framework/render.js';
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
  #pointComponents = new Map();
  #pointEditComponents = new Map();
  #currentEditFormId = null;
  #escKeyDownHandler = null;

  constructor(container, pointsModel) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#escKeyDownHandler = this.#onEscKeyDown.bind(this);
  }

  init() {
    this.#points = [...this.#pointsModel.getPoints()];

    render(this.#sortingComponent, this.#container);
    render(this.#pointsListComponent, this.#container);

    this.#renderPoints();
  }

  #renderPoints() {
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
        this.#replacePointToForm(point.id);
      }
    });

    const pointEditComponent = new PointEditFormView({
      point: point,
      offers: this.#pointsModel.getOffersByType(point.type),
      checkedOffers: this.#pointsModel.getOffersById(point.type, point.offers),
      destination: this.#pointsModel.getDestinationById(point.destination),
      isNew: false,
      onSubmit: () => {
        this.#replaceFormToPoint();
      },
      onClose: () => {
        this.#replaceFormToPoint();
      }
    });

    this.#pointComponents.set(point.id, pointComponent);
    this.#pointEditComponents.set(point.id, pointEditComponent);

    render(pointComponent, container);
  }

  #replacePointToForm(pointId) {
    
    if (this.#currentEditFormId) {
      this.#replaceFormToPoint();
    }

    const pointComponent = this.#pointComponents.get(pointId);
    const pointEditComponent = this.#pointEditComponents.get(pointId);

    if (!pointComponent || !pointEditComponent) {
      return;
    }

    replace(pointEditComponent, pointComponent);
    this.#currentEditFormId = pointId;


    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #replaceFormToPoint() {
    if (!this.#currentEditFormId) {
      return;
    }

    const pointComponent = this.#pointComponents.get(this.#currentEditFormId);
    const pointEditComponent = this.#pointEditComponents.get(this.#currentEditFormId);

    if (!pointComponent || !pointEditComponent) {
      return;
    }


    if (pointEditComponent.element.parentElement) {
      replace(pointComponent, pointEditComponent);
    }

    this.#currentEditFormId = null;


    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #onEscKeyDown(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  }


  destroy() {
    this.#pointComponents.forEach((component) => remove(component));
    this.#pointEditComponents.forEach((component) => remove(component));
    this.#pointComponents.clear();
    this.#pointEditComponents.clear();
    this.#currentEditFormId = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }
}
