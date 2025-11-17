import { render, replace, remove } from '../framework/render.js';
import PointView from '../view/point-view.js';
import PointEditFormView from '../view/point-edit-form-view.js';
import { isEscapeKey } from '../util.js';
import { UserAction, UpdateType, LOWER_LIMIT, UPPER_LIMIT } from '../const.js';
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
  #originalPoint = null;
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
    this.#originalPoint = { ...point };

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;
    const wasEditing = this.#mode === 'EDIT';

    const offers = this.#tripModel.getOffersById(point.type, point.offers);
    const destination = this.#tripModel.getDestinationById(point.destination);

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

    if (wasEditing) {
      replace(this.#pointEditComponent, prevPointEditComponent);
      document.addEventListener('keydown', this.#escKeyDownHandler);
      this.#mode = 'EDIT';
      this.resetState();
    } else {
      if (this.#container.contains(prevPointComponent.element)) {
        replace(this.#pointComponent, prevPointComponent);
      }
    }

    if (this.#container.contains(prevPointEditComponent.element) && !wasEditing) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    if (!wasEditing) {
      remove(prevPointEditComponent);
    }
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
    this.#restoreOriginalState();
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
      this.#pointEditComponent.setAborting();
      this.#pointEditComponent.shake();
    } else {
      this.#pointComponent.shake();
    }
  }

  resetState() {
    if (this.#mode === 'EDIT') {
      this.#pointEditComponent.resetState();
    }
  }

  isEditing() {
    return this.#mode === 'EDIT';
  }

  restoreEditMode() {
    if (this.#pointEditComponent && this.#pointComponent) {
      replace(this.#pointEditComponent, this.#pointComponent);
      document.addEventListener('keydown', this.#escKeyDownHandler);
      this.#mode = 'EDIT';
      this.resetState();
    }
  }

  isDeleting() {
    return this.#pointEditComponent && this.#pointEditComponent.isDeleting();
  }

  getEditComponent() {
    return this.#pointEditComponent;
  }

  #replacePointToForm() {
    this.#handleModeChange();
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = 'EDIT';
  }

  #replaceFormToPoint() {
    if (!this.#pointEditComponent?.element?.parentElement || !this.#pointComponent?.element) {
      return;
    }

    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = null;
  }

  #escKeyDownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.resetView();
    }
  };

  #restoreOriginalState() {
    this.#point = { ...this.#originalPoint };
    const offers = this.#tripModel.getOffersById(this.#point.type, this.#point.offers);
    const destination = this.#tripModel.getDestinationById(this.#point.destination);

    const newPointComponent = new PointView({
      point: this.#point,
      offers: offers,
      destination: destination,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    const newPointEditComponent = new PointEditFormView({
      point: this.#point,
      offers: this.#tripModel.getOffersByType(this.#point.type),
      checkedOffers: offers,
      destination: destination,
      allDestinations: this.#tripModel.destinations,
      allOffers: this.#tripModel.offers,
      isNew: false,
      onSubmit: this.#handleFormSubmit,
      onClose: this.#handleCloseClick,
      onDelete: this.#handleDeleteClick
    });

    replace(newPointComponent, this.#pointComponent);
    this.#pointComponent = newPointComponent;
    this.#pointEditComponent = newPointEditComponent;
  }

  #handleEditClick = () => {
    this.#replacePointToForm();
  };

  #handleFavoriteClick = () => {
    this.#uiBlocker.block();

    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {
        ...this.#point,
        isFavorite: !this.#point.isFavorite
      }
    ).then((isSuccess) => {
      if (!isSuccess) {
        this.setAborting();
      }
    }).catch(() => {
      this.setAborting();
    }).finally(() => {
      this.#uiBlocker.unblock();
    });
  };

  #handleFormSubmit = async (point) => {
    this.setSaving();
    this.#uiBlocker.block();

    try {
      const isSuccess = await this.#handleDataChange(
        UserAction.UPDATE_POINT,
        UpdateType.MINOR,
        point
      );
      if (!isSuccess) {
        this.setAborting();
        return;
      }
    } catch (err) {
      this.setAborting();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleCloseClick = () => {
    this.resetView();
  };

  #handleDeleteClick = async () => {
    this.setDeleting();
    this.#uiBlocker.block();

    try {
      const isSuccess = await this.#handleDataChange(
        UserAction.DELETE_POINT,
        UpdateType.MINOR,
        this.#point
      );
      if (!isSuccess) {
        this.setAborting();
      }
    } catch (err) {
      this.setAborting();
    } finally {
      this.#uiBlocker.unblock();
    }
  };
}
