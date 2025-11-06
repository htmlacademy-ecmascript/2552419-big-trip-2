import { render, remove } from '../framework/render.js';
import { getFiltersData, sortPoints } from '../util.js';
import { SortType, UserAction, LOWER_LIMIT, UPPER_LIMIT } from '../const.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import LoadingView from '../view/loading-view.js';
import EmptyListView from '../view/empty-list-view.js';
import TripInfoView from '../view/trip-info-view.js';
import FiltersView from '../view/filters-view.js';
import PointPresenter from './point-presenter.js';
import PointEditFormView from '../view/point-edit-form-view.js';
import FailedLoadView from '../view/failed-load-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

export default class Presenter {
  #sortingComponent = null;
  #pointsListComponent = null;
  #loadingComponent = null;
  #emptyListComponent = null;
  #tripInfoComponent = null;
  #filtersComponent = null;
  #failedLoadComponent = null;

  #tripEventsContainer = null;
  #tripInfoContainer = null;
  #filtersContainer = null;

  #tripModel = null;
  #pointPresenters = new Map();
  #isLoading = true;
  #isLoadingFailed = false;
  #currentFilter = 'everything';
  #currentSortType = SortType.DAY;
  #newPointPresenter = null;
  #uiBlocker = null;

  constructor(tripEventsContainer, tripInfoContainer, filtersContainer, tripModel) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filtersContainer = filtersContainer;
    this.#tripModel = tripModel;
    this.#uiBlocker = new UiBlocker({
      lowerLimit: LOWER_LIMIT,
      upperLimit: UPPER_LIMIT
    });

    this.#tripModel.addObserver(this.#handleModelEvent);
  }

  init = async () => {
    this.#renderLoading();
    await this.#tripModel.init();
    this.#isLoading = false;
    this.#renderTripEvents();
  };

  createNewPoint = () => {
    this.#currentFilter = 'everything';
    this.#currentSortType = SortType.DAY;
    this.#handleModeChange();
    this.#updateFilters();
    this.#clearTripEvents();
    this.#renderNewPointForm();
  };

  #renderNewPointForm = () => {
    const newPoint = this.#createNewPoint();
    const offers = this.#tripModel.getOffersByType(newPoint.type);
    const destination = this.#tripModel.destinations[0];
    const allDestinations = this.#tripModel.destinations;
    const allOffers = this.#tripModel.offers;

    const pointEditComponent = new PointEditFormView({
      point: newPoint,
      offers: offers,
      checkedOffers: [],
      destination: destination,
      allDestinations: allDestinations,
      allOffers: allOffers,
      isNew: true,
      onSubmit: this.#handleNewPointSubmit,
      onClose: this.#handleNewPointClose,
      onDelete: this.#handleNewPointClose
    });

    render(pointEditComponent, this.#tripEventsContainer);

    this.#newPointPresenter = {
      component: pointEditComponent,
      destroy: () => remove(pointEditComponent),
      setSaving: () => pointEditComponent.setSaving(),
      setAborting: () => {
        const resetFormState = () => {
          pointEditComponent.updateElement({
            isSaving: false,
            isDeleting: false
          });
        };
        pointEditComponent.shake(resetFormState);
      }
    };
  };

  #createNewPoint = () => {
    const defaultDestination = this.#tripModel.destinations[0];

    return {
      id: null,
      type: 'flight',
      dateFrom: null,
      dateTo: null,
      destination: defaultDestination ? defaultDestination.id : null,
      basePrice: 0,
      isFavorite: false,
      offers: []
    };
  };

  #handleNewPointSubmit = async (point) => {
    this.#uiBlocker.block();

    this.#newPointPresenter.setSaving();

    if (!this.#validatePoint(point)) {
      this.#newPointPresenter.setAborting();
      return;
    }

    await this.#tripModel.addPoint('MINOR', point);
    this.#handleNewPointClose();
    this.#uiBlocker.unblock();
  };

  #handleNewPointClose = () => {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }

    this.#renderTripEvents();
  };

  #validatePoint = (point) => {
    const destinationInput = document.querySelector('.event__input--destination');
    const destinationName = destinationInput?.value;
    const isValidDestination = this.#tripModel.destinations.some(dest => dest.name === destinationName);

    if (!isValidDestination) {
      destinationInput?.focus();
      return false;
    }

    const dateFrom = new Date(point.dateFrom);
    const dateTo = new Date(point.dateTo);

    if (dateFrom >= dateTo) {
      return false;
    }

    if (point.basePrice < 0) {
      return false;
    }

    return true;
  };

  #renderTripInfo = () => {
    const points = this.#tripModel.points;
    const destinations = this.#tripModel.destinations;
    const totalCost = this.#tripModel.calculateTotalCost();

    this.#tripInfoComponent = new TripInfoView({
      points,
      destinations,
      totalCost
    });

    render(this.#tripInfoComponent, this.#tripInfoContainer);
  };

  #renderFilters = () => {
    const filters = getFiltersData(this.#tripModel.points);
    this.#filtersComponent = new FiltersView(filters, this.#currentFilter);
    this.#filtersComponent.setFilterChangeHandler(this.#handleFilterChange);
    render(this.#filtersComponent, this.#filtersContainer);
  };

  #renderLoading = () => {
    this.#clearTripEvents();
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#tripEventsContainer);
  };

  #renderFailedLoad = () => {
    this.#clearTripEvents();
    this.#failedLoadComponent = new FailedLoadView();
    render(this.#failedLoadComponent, this.#tripEventsContainer);
  };

  #renderEmptyList = (filterType = 'everything') => {
    this.#emptyListComponent = new EmptyListView(filterType);
    render(this.#emptyListComponent, this.#tripEventsContainer);
  };

  #clearTripEvents = () => {
    remove(this.#sortingComponent);
    remove(this.#pointsListComponent);
    remove(this.#loadingComponent);
    remove(this.#emptyListComponent);
    remove(this.#failedLoadComponent);
  };

  #renderTripEvents = () => {
    this.#clearTripEvents();

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    const filteredPoints = this.#getFilteredPoints(this.#currentFilter);

    if (filteredPoints.length === 0) {
      this.#renderEmptyList(this.#currentFilter);
      return;
    }

    this.#renderSorting();
    this.#renderPointsList();
    this.#renderPoints(filteredPoints);
  };

  #renderSorting = () => {
    this.#sortingComponent = new SortingView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortingComponent, this.#tripEventsContainer);
  };

  #renderPointsList = () => {
    this.#pointsListComponent = new PointsListView();
    render(this.#pointsListComponent, this.#tripEventsContainer);
  };

  #renderPoints = (points) => {
    const sortedPoints = sortPoints(points, this.#currentSortType);
    const pointsListElement = this.#pointsListComponent.element;

    sortedPoints.forEach((point) => {
      this.#renderPoint(point, pointsListElement);
    });
  };

  #renderPoint = (point, container) => {
    const pointPresenter = new PointPresenter(
      container,
      this.#tripModel,
      this.#handleViewAction,
      this.#handleModeChange
    );
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  };

  #clearPoints = () => {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  };

  #getFilteredPoints = (filterType) => {
    const allPoints = this.#tripModel.points;

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
  };

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

  #handleViewAction = async (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        await this.#tripModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        await this.#tripModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        await this.#tripModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case 'PATCH':
        this.#pointPresenters.get(data.id).init(data);
        this.#updateTripInfo();
        this.#updateFilters();
        break;
      case 'MINOR':
        this.#updateTripInfo();
        this.#updateFilters();
        this.#clearPoints();
        this.#renderTripEvents();
        break;
      case 'MAJOR':
        this.#updateTripInfo();
        this.#updateFilters();
        this.#clearPoints();
        this.#renderTripEvents();
        break;
      case 'INIT':
        this.#isLoading = false;
        this.#updateTripInfo();
        this.#updateFilters();
        this.#renderTripEvents();
        break;
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
  };

  #updateTripInfo = () => {
    if (this.#tripInfoComponent) {
      remove(this.#tripInfoComponent);
    }
    this.#renderTripInfo();
  };

  #updateFilters = () => {
    if (this.#filtersComponent) {
      remove(this.#filtersComponent);
    }
    this.#renderFilters();
  };

  destroy = () => {
    this.#clearPoints();
    this.#clearTripEvents();

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
  };
}
