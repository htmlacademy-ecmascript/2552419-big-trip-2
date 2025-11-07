import { render, replace, remove } from '../framework/render.js';
import PointView from '../view/point-view.js';
import PointEditFormView from '../view/point-edit-form-view.js';
import { isEscapeKey } from '../util.js';
import { UserAction, LOWER_LIMIT, UPPER_LIMIT } from '../const.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

export default class PointPresenter {
  #container = null;
  #tripModel = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #uiBlocker = null;

  #pointComponent = null;
  #pointEditComponent = null;
  #point = null;
  #mode = null;

  constructor(container, tripModel, onDataChange, onModeChange) {
    this.#container = container;
    this.#tripModel = tripModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
    this.#uiBlocker = new UiBlocker({
      lowerLimit: LOWER_LIMIT,
      upperLimit: UPPER_LIMIT
    });
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    const offers = this.#tripModel.getOffersById(point.type, point.offers);
    const destination = this.#tripModel.getDestinationById(point.destination);

    if (!destination) {
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
      allDestinations: this.#tripModel.destinations,
      allOffers: this.#tripModel.offers,
      isNew: false,
      onSubmit: this.#handleFormSubmit,
      onClose: this.#handleCloseClick,
      onDelete: this.#handleDeleteClick
    });

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === 'EDIT') {
      replace(this.#pointComponent, prevPointEditComponent);
      this.#mode = null;
    }

    if (this.#container.contains(prevPointComponent.element)) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#container.contains(prevPointEditComponent.element)) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  resetView() {
    if (this.#mode !== 'EDIT') {
      return;
    }
    this.#replaceFormToPoint();
  }

  setSaving() {
    if (this.#mode === 'EDIT') {
      this.#pointEditComponent.setSaving();
    }
  }

  setDeleting() {
    if (this.#mode === 'EDIT') {
      this.#pointEditComponent.setDeleting();
    }
  }

  setAborting() {
    if (this.#mode === 'EDIT') {
      const resetFormState = () => {
        this.#pointEditComponent.updateElement({
          isSaving: false,
          isDeleting: false
        });
      };

      this.#pointEditComponent.shake(resetFormState);
    }
  }

  #replacePointToForm() {
    this.#handleModeChange();
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = 'EDIT';
  }

  #replaceFormToPoint() {
    if (this.#pointEditComponent && this.#pointEditComponent.element.parentElement &&
        this.#pointComponent && this.#pointComponent.element) {
      replace(this.#pointComponent, this.#pointEditComponent);
    }
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = null;
  }

  #escKeyDownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  #handleEditClick = () => {
    this.#replacePointToForm();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      'PATCH',
      {
        ...this.#point,
        isFavorite: !this.#point.isFavorite
      }
    );
  };

  #handleFormSubmit = async (point) => {
    this.#uiBlocker.block();

    try {
      await this.#handleDataChange(
        UserAction.UPDATE_POINT,
        'MINOR',
        point
      );
    } catch(err) {
      this.setAborting();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleCloseClick = () => {
    this.#replaceFormToPoint();
  };

  #handleDeleteClick = async () => {
    this.#uiBlocker.block();

    try {
      await this.#handleDataChange(
        UserAction.DELETE_POINT,
        'MINOR',
        this.#point
      );
    } catch(err) {
      this.setAborting();
    } finally {
      this.#uiBlocker.unblock();
    }
  };
}