import { render, replace, remove } from '../framework/render.js';
import { isEscapeKey, getFiltersData } from '../util.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import PointView from '../view/point-view.js';
import PointEditFormView from '../view/point-edit-form-view.js';
import LoadingView from '../view/loading-view.js';
import EmptyListView from '../view/empty-list-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FiltersView from '../view/filters-view.js';

export default class Presenter {
  #sortingComponent = null;
  #pointsListComponent = null;
  #loadingComponent = null;
  #emptyListComponent = null;
  #tripInfoComponent = null;
  #filtersComponent = null;

  #tripEventsContainer = null;
  #tripInfoContainer = null;
  #filtersContainer = null;

  #pointsModel = null;
  #points = [];
  #pointComponents = new Map();
  #pointEditComponents = new Map();
  #currentEditFormId = null;
  #escKeyDownHandler = null;
  #isLoading = true;
  #currentFilter = 'everything';

  constructor(tripEventsContainer, tripInfoContainer, filtersContainer, pointsModel) {
  
    if (!tripEventsContainer || !tripInfoContainer || !filtersContainer || !pointsModel) {

      return;
    }

    this.#tripEventsContainer = tripEventsContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#escKeyDownHandler = this.#onEscKeyDown.bind(this);


    this.#sortingComponent = new SortingView();
    this.#pointsListComponent = new PointsListView();
    this.#loadingComponent = new LoadingView();
  }

  init() {


    this.#renderTripInfo();
    this.#renderFilters();
    this.#renderLoading();


    setTimeout(() => {

      this.#isLoading = false;
      this.#points = [...this.#pointsModel.getPoints()];

      this.#renderTripEvents();
    }, 1000);
  }

  #renderTripInfo() {

    const points = this.#pointsModel.getPoints();
    const destinations = this.#pointsModel.getDestinations();
    const totalCost = this.#pointsModel.calculateTotalCost();

    this.#tripInfoComponent = new TripInfoView({
      points,
      destinations,
      totalCost
    });

    render(this.#tripInfoComponent, this.#tripInfoContainer);
  }

  #renderFilters() {

    const filters = getFiltersData(this.#pointsModel.getPoints());
    this.#filtersComponent = new FiltersView(filters);

    this.#filtersComponent.setFilterChangeHandler(this.#handleFilterChange);

    render(this.#filtersComponent, this.#filtersContainer);
  }

  #renderLoading() {

    this.#clearTripEvents();
    render(this.#loadingComponent, this.#tripEventsContainer);
  }

  #renderEmptyList(filterType = 'everything') {

    this.#emptyListComponent = new EmptyListView(filterType);
    render(this.#emptyListComponent, this.#tripEventsContainer);
  }

  #clearTripEvents() {

    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
    }
    if (this.#pointsListComponent) {
      remove(this.#pointsListComponent);
    }
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
    }
    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
    }
  }

  #renderTripEvents() {

    this.#clearTripEvents();

    const filteredPoints = this.#getFilteredPoints(this.#currentFilter);


    if (filteredPoints.length === 0) {
      this.#renderEmptyList(this.#currentFilter);
      return;
    }

    this.#renderSorting();
    this.#renderPointsList();
    this.#renderPoints(filteredPoints);
  }

  #renderSorting() {

    render(this.#sortingComponent, this.#tripEventsContainer);
  }

  #renderPointsList() {

    render(this.#pointsListComponent, this.#tripEventsContainer);
  }

  #renderPoints(points) {

    const pointsListElement = this.#pointsListComponent.element;

    points.forEach((point) => {
      this.#renderPoint(point, pointsListElement);
    });
  }

  #renderPoint(point, container) {



    const offers = this.#pointsModel.getOffersById(point.type, point.offers);
    const destination = this.#pointsModel.getDestinationById(point.destination);

    if (!destination) {

      return;
    }

    const pointComponent = new PointView({
      point: point,
      offers: offers,
      destination: destination,
      onEditClick: () => {
        this.#replacePointToForm(point.id);
      }
    });

    const pointEditComponent = new PointEditFormView({
      point: point,
      offers: this.#pointsModel.getOffersByType(point.type),
      checkedOffers: offers,
      destination: destination,
      isNew: false,
      onSubmit: () => {
        this.#replaceFormToPoint();
      },
      onClose: () => {
        this.#replaceFormToPoint();
      },
      onDelete: () => {
        this.#handleDeletePoint(point.id);
      }
    });

    this.#pointComponents.set(point.id, pointComponent);
    this.#pointEditComponents.set(point.id, pointEditComponent);

    render(pointComponent, container);
  }

  #getFilteredPoints(filterType) {
    const allPoints = this.#pointsModel.getPoints();

    switch (filterType) {
      case 'future':
        return allPoints.filter(point => new Date(point.dateFrom) > new Date());
      case 'present':
        return allPoints.filter(point =>
          new Date(point.dateFrom) <= new Date() && new Date(point.dateTo) >= new Date()
        );
      case 'past':
        return allPoints.filter(point => new Date(point.dateTo) < new Date());
      default:
        return allPoints;
    }
  }

  #handleFilterChange = (filterType) => {

    this.#currentFilter = filterType;
    this.#renderTripEvents();
  };

  #handleDeletePoint = (pointId) => {



    this.#pointsModel.deletePoint(pointId);

    this.#points = this.#pointsModel.getPoints();

    this.#updateTripInfo();

    this.#updateFilters();

    const pointComponent = this.#pointComponents.get(pointId);
    const pointEditComponent = this.#pointEditComponents.get(pointId);

    if (pointComponent) {
      remove(pointComponent);
      this.#pointComponents.delete(pointId);
    }

    if (pointEditComponent) {
      remove(pointEditComponent);
      this.#pointEditComponents.delete(pointId);
    }


    if (this.#currentEditFormId === pointId) {
      this.#currentEditFormId = null;
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }


    this.#renderTripEvents();
  };

  #updateTripInfo() {
    if (this.#tripInfoComponent) {
      remove(this.#tripInfoComponent);
    }
    this.#renderTripInfo();
  }

  #updateFilters() {
    if (this.#filtersComponent) {
      remove(this.#filtersComponent);
    }
    this.#renderFilters();
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
    if (isEscapeKey(evt)) {
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
