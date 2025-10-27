import { render, remove } from '../framework/render.js';
import { getFiltersData, sortPoints, LOADING_DELAY } from '../util.js';
import { SortType } from '../const.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import LoadingView from '../view/loading-view.js';
import EmptyListView from '../view/empty-list-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FiltersView from '../view/filters-view.js';
import PointPresenter from './point-presenter.js';

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
  #pointPresenters = new Map();
  #isLoading = true;
  #currentFilter = 'everything';
  #currentSortType = SortType.DAY;

  constructor(tripEventsContainer, tripInfoContainer, filtersContainer, pointsModel) {
    if (!tripEventsContainer || !tripInfoContainer || !filtersContainer || !pointsModel) {
      throw new Error('Presenter: Required containers or model not provided');
    }

    this.#tripEventsContainer = tripEventsContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#renderTripInfo();
    this.#renderFilters();
    this.#renderLoading();

    setTimeout(() => {
      this.#isLoading = false;
      this.#points = [...this.#pointsModel.getPoints()];
      this.#renderTripEvents();
    }, LOADING_DELAY);
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
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#tripEventsContainer);
  }

  #renderEmptyList(filterType = 'everything') {
    this.#emptyListComponent = new EmptyListView(filterType);
    render(this.#emptyListComponent, this.#tripEventsContainer);
  }

  #clearTripEvents() {
    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
      this.#sortingComponent = null;
    }
    if (this.#pointsListComponent) {
      remove(this.#pointsListComponent);
      this.#pointsListComponent = null;
    }
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }
    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
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
    this.#sortingComponent = new SortingView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortingComponent, this.#tripEventsContainer);
  }

  #renderPointsList() {
    this.#pointsListComponent = new PointsListView();
    render(this.#pointsListComponent, this.#tripEventsContainer);
  }

  #renderPoints(points) {
    const sortedPoints = sortPoints(points, this.#currentSortType);
    const pointsListElement = this.#pointsListComponent.element;

    sortedPoints.forEach((point) => {
      this.#renderPoint(point, pointsListElement);
    });
  }

  #renderPoint(point, container) {
    const pointPresenter = new PointPresenter(
      container,
      this.#pointsModel,
      this.#handlePointChange,
      this.#handleModeChange
    );
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
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

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPoints();
    this.#renderTripEvents();
  };

  #handleFilterChange = (filterType) => {
    this.#currentFilter = filterType;
    this.#clearPoints();
    this.#renderTripEvents();
  };

  #handlePointChange = (updatedPoint, isDeleting = false) => {
    if (isDeleting) {
      this.#pointsModel.deletePoint(updatedPoint.id);
      this.#points = this.#pointsModel.getPoints();

      const presenter = this.#pointPresenters.get(updatedPoint.id);
      if (presenter) {
        presenter.destroy();
        this.#pointPresenters.delete(updatedPoint.id);
      }
    } else {
      this.#pointsModel.updatePoint(updatedPoint);
      this.#points = this.#pointsModel.getPoints();

      const presenter = this.#pointPresenters.get(updatedPoint.id);
      if (presenter) {
        presenter.init(updatedPoint);
      }
    }

    this.#updateTripInfo();
    this.#updateFilters();

    if (isDeleting) {
      this.#renderTripEvents();
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
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

  destroy() {
    this.#clearPoints();
    this.#clearTripEvents();
  }
}
