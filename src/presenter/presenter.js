import { render, remove } from '../framework/render.js';
import { getFiltersData } from '../util.js';
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

  constructor(tripEventsContainer, tripInfoContainer, filtersContainer, pointsModel) {
    if (!tripEventsContainer || !tripInfoContainer || !filtersContainer || !pointsModel) {
      throw new Error('Presenter: Required containers or model not provided');
    }

    this.#tripEventsContainer = tripEventsContainer;
    this.#tripInfoContainer = tripInfoContainer;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;

    this.#sortingComponent = new SortingView();
    this.#pointsListComponent = new PointsListView();
    this.#loadingComponent = new LoadingView();
  }

  init() {
    try {
      this.#renderTripInfo();
      this.#renderFilters();
      this.#renderLoading();

      setTimeout(() => {
        this.#isLoading = false;
        this.#points = [...this.#pointsModel.getPoints()];
        this.#renderTripEvents();
      }, 1000);
    } catch (error) {
      console.error('Error initializing presenter:', error);
    }
  }

  #renderTripInfo() {
    try {
      const points = this.#pointsModel.getPoints();
      const destinations = this.#pointsModel.getDestinations();
      const totalCost = this.#pointsModel.calculateTotalCost();

      this.#tripInfoComponent = new TripInfoView({
        points,
        destinations,
        totalCost
      });

      render(this.#tripInfoComponent, this.#tripInfoContainer);
    } catch (error) {
      console.error('Error rendering trip info:', error);
    }
  }

  #renderFilters() {
    try {
      const filters = getFiltersData(this.#pointsModel.getPoints());
      this.#filtersComponent = new FiltersView(filters);

      this.#filtersComponent.setFilterChangeHandler(this.#handleFilterChange);

      render(this.#filtersComponent, this.#filtersContainer);
    } catch (error) {
      console.error('Error rendering filters:', error);
    }
  }

  #renderLoading() {
    try {
      this.#clearTripEvents();
      render(this.#loadingComponent, this.#tripEventsContainer);
    } catch (error) {
      console.error('Error rendering loading:', error);
    }
  }

  #renderEmptyList(filterType = 'everything') {
    try {
      this.#emptyListComponent = new EmptyListView(filterType);
      render(this.#emptyListComponent, this.#tripEventsContainer);
    } catch (error) {
      console.error('Error rendering empty list:', error);
    }
  }

  #clearTripEvents() {
    try {
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
    } catch (error) {
      console.error('Error clearing trip events:', error);
    }
  }

  #renderTripEvents() {
    try {
      this.#clearTripEvents();

      const filteredPoints = this.#getFilteredPoints(this.#currentFilter);

      if (filteredPoints.length === 0) {
        this.#renderEmptyList(this.#currentFilter);
        return;
      }

      this.#renderSorting();
      this.#renderPointsList();
      this.#renderPoints(filteredPoints);
    } catch (error) {
      console.error('Error rendering trip events:', error);
    }
  }

  #renderSorting() {
    try {
      render(this.#sortingComponent, this.#tripEventsContainer);
    } catch (error) {
      console.error('Error rendering sorting:', error);
    }
  }

  #renderPointsList() {
    try {
      render(this.#pointsListComponent, this.#tripEventsContainer);
    } catch (error) {
      console.error('Error rendering points list:', error);
    }
  }

  #renderPoints(points) {
    try {
      const pointsListElement = this.#pointsListComponent.element;

      points.forEach((point) => {
        this.#renderPoint(point, pointsListElement);
      });
    } catch (error) {
      console.error('Error rendering points:', error);
    }
  }

  #renderPoint(point, container) {
    try {
      const pointPresenter = new PointPresenter(
        container,
        this.#pointsModel,
        this.#handlePointChange,
        this.#handleModeChange
      );
      pointPresenter.init(point);
      this.#pointPresenters.set(point.id, pointPresenter);
    } catch (error) {
      console.error(`Error rendering point ${point.id}:`, error);
    }
  }

  #clearPoints() {
    try {
      this.#pointPresenters.forEach((presenter) => presenter.destroy());
      this.#pointPresenters.clear();
    } catch (error) {
      console.error('Error clearing points:', error);
    }
  }

  #getFilteredPoints(filterType) {
    try {
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
    } catch (error) {
      console.error('Error filtering points:', error);
      return [];
    }
  }

  #handleFilterChange = (filterType) => {
    try {
      this.#currentFilter = filterType;
      this.#clearPoints();
      this.#renderTripEvents();
    } catch (error) {
      console.error('Error handling filter change:', error);
    }
  };

  #handlePointChange = (updatedPoint, isDeleting = false) => {
    try {
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
    } catch (error) {
      console.error('Error handling point change:', error);
      
    }
  };

  #handleModeChange = () => {
    try {
      this.#pointPresenters.forEach((presenter) => presenter.resetView());
    } catch (error) {
      console.error('Error handling mode change:', error);
    }
  };

  #updateTripInfo() {
    try {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
      }
      this.#renderTripInfo();
    } catch (error) {
      console.error('Error updating trip info:', error);
    }
  }

  #updateFilters() {
    try {
      if (this.#filtersComponent) {
        remove(this.#filtersComponent);
      }
      this.#renderFilters();
    } catch (error) {
      console.error('Error updating filters:', error);
    }
  }

  destroy() {
    try {
      this.#pointPresenters.forEach((presenter) => presenter.destroy());
      this.#pointPresenters.clear();
    } catch (error) {
      console.error('Error destroying presenter:', error);
    }
  }
}