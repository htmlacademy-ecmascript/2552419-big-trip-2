import { render, replace, remove } from '../framework/render.js';
import PointView from '../view/point-view.js';
import PointEditFormView from '../view/point-edit-form-view.js';
import { isEscapeKey } from '../util.js';

export default class PointPresenter {
  #container = null;
  #tripModel = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #pointEditComponent = null;
  #point = null;

  constructor(container, tripModel, onDataChange, onModeChange) {
    if (!container || !tripModel || !onDataChange || !onModeChange) {
      throw new Error('PointPresenter: Required dependencies not provided');
    }

    this.#container = container;
    this.#tripModel = tripModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    try {
      this.#point = point;

      const prevPointComponent = this.#pointComponent;
      const prevPointEditComponent = this.#pointEditComponent;

      const offers = this.#tripModel.getOffersById(point.type, point.offers);
      const destination = this.#tripModel.getDestinationById(point.destination);

      if (!destination) {
        console.warn(`Destination not found for point ${point.id}`);
        return;
      }

      this.#pointComponent = new PointView({
        point: this.#point,
        offers: offers,
        destination: destination,
        onEditClick: this.#handleEditClick,
        onFavoriteClick: this.#handleFavoriteClick
      });

      this.#pointEditComponent = new PointEditFormView({
        point: this.#point,
        offers: this.#tripModel.getOffersByType(point.type),
        checkedOffers: offers,
        destination: destination,
        isNew: false,
        onSubmit: this.#handleFormSubmit,
        onClose: this.#handleCloseClick,
        onDelete: this.#handleDeleteClick
      });

      if (prevPointComponent === null || prevPointEditComponent === null) {
        render(this.#pointComponent, this.#container);
        return;
      }

      if (this.#container.contains(prevPointComponent.element)) {
        replace(this.#pointComponent, prevPointComponent);
      }

      if (this.#container.contains(prevPointEditComponent.element)) {
        replace(this.#pointEditComponent, prevPointEditComponent);
      }

      remove(prevPointComponent);
      remove(prevPointEditComponent);
    } catch (error) {
      console.error(`Error initializing point presenter for point ${point?.id}:`, error);
    }
  }

  destroy() {
    try {
      remove(this.#pointComponent);
      remove(this.#pointEditComponent);
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    } catch (error) {
      console.error('Error destroying point presenter:', error);
    }
  }

  resetView() {
    try {
      if (this.#pointEditComponent && this.#container.contains(this.#pointEditComponent.element)) {
        this.#replaceFormToPoint();
      }
    } catch (error) {
      console.error('Error resetting point view:', error);
    }
  }

  #replacePointToForm() {
    try {
      this.#handleModeChange();
      replace(this.#pointEditComponent, this.#pointComponent);
      document.addEventListener('keydown', this.#escKeyDownHandler);
    } catch (error) {
      console.error('Error replacing point with form:', error);
    }
  }

  #replaceFormToPoint() {
    try {
      replace(this.#pointComponent, this.#pointEditComponent);
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    } catch (error) {
      console.error('Error replacing form with point:', error);
    }
  }

  #escKeyDownHandler = (evt) => {
    try {
      if (isEscapeKey(evt)) {
        evt.preventDefault();
        this.#replaceFormToPoint();
      }
    } catch (error) {
      console.error('Error handling escape key:', error);
    }
  };

  #handleEditClick = () => {
    try {
      this.#replacePointToForm();
    } catch (error) {
      console.error('Error handling edit click:', error);
    }
  };

  #handleFavoriteClick = () => {
    try {
      this.#handleDataChange({
        ...this.#point,
        isFavorite: !this.#point.isFavorite
      });
    } catch (error) {
      console.error('Error handling favorite click:', error);
    }
  };

  #handleFormSubmit = (point) => {
    try {
      this.#handleDataChange(point);
      this.#replaceFormToPoint();
    } catch (error) {
      console.error('Error handling form submit:', error);
    }
  };

  #handleCloseClick = () => {
    try {
      this.#replaceFormToPoint();
    } catch (error) {
      console.error('Error handling close click:', error);
    }
  };

  #handleDeleteClick = () => {
    try {
      this.#handleDataChange(this.#point, true);
    } catch (error) {
      console.error('Error handling delete click:', error);
    }
  };
}
