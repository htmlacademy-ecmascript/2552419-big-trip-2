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
import PointEditFormView from '../view/point-edit-form-view.js';

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
  #newPointPresenter = null;

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

  createNewPoint() {
    this.#currentFilter = 'everything';
    this.#currentSortType = SortType.DAY;

    // Сбрасываем все открытые формы редактирования
    this.#handleModeChange();

    // Обновляем UI фильтров
    this.#updateFilters();

    // Создаем новую точку
    const newPoint = this.#createNewPoint();

    // Рендерим форму создания новой точки
    this.#renderNewPointForm(newPoint);
  }

  #createNewPoint() {
    const defaultDestination = this.#pointsModel.getDestinations()[0];

    return {
      id: `new-${Date.now()}`,
      type: 'flight',
      dateFrom: new Date().toISOString(),
      dateTo: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 часа
      destination: defaultDestination ? defaultDestination.id : null,
      basePrice: 0,
      isFavorite: false,
      offers: []
    };
  }

  #renderNewPointForm(point) {
    const offers = this.#pointsModel.getOffersByType(point.type);
    const destination = point.destination ? this.#pointsModel.getDestinationById(point.destination) : null;
    const allDestinations = this.#pointsModel.getDestinations();
    const allOffers = this.#pointsModel.getOffers();

    const pointEditComponent = new PointEditFormView({
      point: point,
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

    if (this.#pointsListComponent) {
      render(pointEditComponent, this.#pointsListComponent.element, 'afterbegin');
    } else {
      render(pointEditComponent, this.#tripEventsContainer, 'afterbegin');
    }

    this.#newPointPresenter = {
      destroy: () => remove(pointEditComponent)
    };
  }

  #handleNewPointSubmit = (point) => {
    // Валидация дат
    const dateFrom = new Date(point.dateFrom);
    const dateTo = new Date(point.dateTo);

    if (dateFrom >= dateTo) {
      alert('Дата начала должна быть раньше даты окончания');
      return;
    }

    // Удаляем временный ID
    const { id, ...pointData } = point;

    // Добавляем точку в модель
    this.#pointsModel.addPoint(pointData);
    this.#points = this.#pointsModel.getPoints();

    // Закрываем форму создания
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }

    // Обновляем UI
    this.#updateTripInfo();
    this.#updateFilters();
    this.#clearPoints();
    this.#renderTripEvents();
  };

  #handleNewPointClose = () => {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
  };

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

    // Закрываем форму создания новой точки
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
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

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
  }
}
