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

export default class BoardPresenter {
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
  #newEventButton = null;

  #tripModel = null;
  #pointPresenters = new Map();
  #isLoading = true;
  #isLoadingFailed = false;
  #currentFilter = 'everything';
  #currentSortType = SortType.DAY;
  #newPointPresenter = null;
  #uiBlocker = null;

  constructor(tripEventsContainer, tripInfoContainer, filtersContainer, tripModel, newEventButton) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filtersContainer = filtersContainer;
    this.#tripModel = tripModel;
    this.#newEventButton = newEventButton;
    this.#uiBlocker = new UiBlocker({
      lowerLimit: LOWER_LIMIT,
      upperLimit: UPPER_LIMIT
    });
    this.#tripModel.addObserver(this.#handleModelEvent);
  }

  init = async () => {
    this.#renderLoading();
    this.#setNewEventButtonState(true);

    try {
      await this.#tripModel.init();
      if (this.#tripModel.hasError) {
        this.#isLoading = false;
        this.#isLoadingFailed = true;
        this.#setNewEventButtonState(true);
        this.#renderTripEvents();
      } else {
        this.#isLoading = false;
        this.#isLoadingFailed = false;
        this.#setNewEventButtonState(false);
        this.#renderTripEvents();
      }
    } catch (error) {
      this.#isLoading = false;
      this.#isLoadingFailed = true;
      this.#setNewEventButtonState(true);
      this.#renderTripEvents();
    }
  };

  createNewPoint = () => {
    if (this.#isLoadingFailed) {
      return;
    }

    this.#currentFilter = 'everything';
    this.#currentSortType = SortType.DAY;
    this.#handleModeChange();
    this.#updateFilters();
    this.#setNewEventButtonState(true);
    this.#renderNewPointForm();
  };

  #setNewEventButtonState = (isDisabled) => {
    if (this.#newEventButton) {
      this.#newEventButton.disabled = isDisabled || this.#isLoadingFailed;
    }
  };

  #renderNewPointForm = () => {
    this.#handleModeChange();

    const newPoint = this.#createNewPoint();
    const offers = this.#tripModel.getOffersByType(newPoint.type);
    const destination = null;
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

    this.#clearTripEvents();
    this.#renderSorting();
    this.#renderPointsList();
    this.#renderPoints(this.#getFilteredPoints(this.#currentFilter));
    render(pointEditComponent, this.#pointsListComponent.element, 'afterbegin');

    this.#newPointPresenter = {
      component: pointEditComponent,
      destroy: () => {
        remove(pointEditComponent);
      },
      setSaving: () => pointEditComponent.setSaving(),
      setAborting: () => {
        pointEditComponent.setAborting();
        pointEditComponent.shake();
      }
    };
  };

  #createNewPoint = () => {
    return {
      id: null,
      type: 'flight',
      dateFrom: null,
      dateTo: null,
      destination: null,
      basePrice: 0,
      isFavorite: false,
      offers: []
    };
  };

  #handleNewPointSubmit = async (point) => {
    this.#uiBlocker.block();
    this.#newPointPresenter.setSaving();

    try {
      await this.#tripModel.addPoint('MINOR', point);
      this.#handleNewPointClose();
    } catch (err) {
      this.#newPointPresenter.setAborting();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleNewPointClose = () => {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }

    this.#setNewEventButtonState(false);
    this.#renderTripEvents();
  };

  #renderTripInfo = () => {
    if (this.#isLoadingFailed) {
      remove(this.#tripInfoComponent);
      this.#tripInfoComponent = null;
      return;
    }

    const points = this.#tripModel.points;

    if (!points || points.length === 0) {
      remove(this.#tripInfoComponent);
      this.#tripInfoComponent = null;
      return;
    }

    const destinations = this.#tripModel.destinations;
    const totalCost = this.#tripModel.calculateTotalCost();

    remove(this.#tripInfoComponent);

    this.#tripInfoComponent = new TripInfoView({
      points,
      destinations,
      totalCost
    });

    render(this.#tripInfoComponent, this.#tripInfoContainer);
  };

  #renderFilters = () => {
    if (this.#isLoadingFailed) {
      remove(this.#filtersComponent);
      this.#filtersComponent = null;
      return;
    }

    const filters = getFiltersData(this.#tripModel.points);

    remove(this.#filtersComponent);

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

    this.#sortingComponent = null;
    this.#pointsListComponent = null;
    this.#loadingComponent = null;
    this.#emptyListComponent = null;
    this.#failedLoadComponent = null;
  };

  #renderTripEvents = () => {
    this.#clearTripEvents();

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.#isLoadingFailed) {
      this.#renderFailedLoad();
      return;
    }

    const filteredPoints = this.#getFilteredPoints(this.#currentFilter);

    if (filteredPoints.length === 0 && !this.#newPointPresenter) {
      this.#renderEmptyList(this.#currentFilter);
      return;
    }

    if (filteredPoints.length > 0 || this.#newPointPresenter) {
      this.#renderSorting();
      this.#renderPointsList();
      if (!this.#newPointPresenter) {
        this.#renderPoints(filteredPoints);
      }
    }
  };

  #renderSorting = () => {
    if (this.#isLoadingFailed) {
      return;
    }

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
    if (this.#isLoadingFailed || !this.#tripModel.points) {
      return [];
    }

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
    this.#currentSortType = SortType.DAY;
    this.#clearPoints();
    this.#renderTripEvents();
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    try {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          this.#pointPresenters.get(update.id)?.setSaving();
          await this.#tripModel.updatePoint(updateType, update);
          break;
        case UserAction.ADD_POINT:
          await this.#tripModel.addPoint(updateType, update);
          break;
        case UserAction.DELETE_POINT:
          this.#pointPresenters.get(update.id)?.setDeleting();
          await this.#tripModel.deletePoint(updateType, update);
          break;
      }
      return true;
    } catch (err) {
      if (update?.id) {
        this.#pointPresenters.get(update.id)?.setAborting();
      }
      return false;
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case 'PATCH':
        this.#pointPresenters.get(data.id)?.init(data);
        this.#updateTripInfo();
        this.#updateFilters();
        break;
      case 'MINOR': {
        const deletingPresenterId = this.#getDeletingPointId();

        if (deletingPresenterId && this.#pointPresenters.has(deletingPresenterId)) {
          const deletingPresenter = this.#pointPresenters.get(deletingPresenterId);
          if (deletingPresenter.isDeleting()) {
            deletingPresenter.resetView();
          }
        }

        this.#updateTripInfo();
        this.#updateFilters();
        this.#clearPoints();
        this.#renderTripEvents();

        if (this.#newPointPresenter) {
          render(this.#newPointPresenter.component, this.#pointsListComponent.element, 'afterbegin');
        }
        break;
      }
      case 'MAJOR':
        this.#updateTripInfo();
        this.#updateFilters();
        this.#clearPoints();
        this.#renderTripEvents();
        break;
      case 'INIT':
        this.#isLoading = false;
        this.#isLoadingFailed = false;
        this.#setNewEventButtonState(false);
        this.#updateTripInfo();
        this.#updateFilters();
        this.#renderTripEvents();
        break;
      case 'ERROR':
        this.#isLoading = false;
        this.#isLoadingFailed = true;
        this.#setNewEventButtonState(true);
        this.#renderTripEvents();
        break;
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
      this.#setNewEventButtonState(false);
    }
  };

  #getEditingPointId() {
    for (const [id, presenter] of this.#pointPresenters) {
      if (presenter.isEditing()) {
        return id;
      }
    }
    return null;
  }

  #getDeletingPointId() {
    for (const [id, presenter] of this.#pointPresenters) {
      if (presenter.isDeleting()) {
        return id;
      }
    }
    return null;
  }

  #updateTripInfo = () => {
    this.#renderTripInfo();
  };

  #updateFilters = () => {
    this.#renderFilters();
  };

  destroy = () => {
    this.#clearPoints();
    this.#clearTripEvents();

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }

    remove(this.#tripInfoComponent);
    this.#tripInfoComponent = null;

    remove(this.#filtersComponent);
    this.#filtersComponent = null;
  };
}

