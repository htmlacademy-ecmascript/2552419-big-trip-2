import { render } from '../render.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import PointView from '../view/point-view.js';
import PointEditFormView from '../view/point-edit-form-view.js';

export default class Presenter {
  sortingComponent = new SortingView();
  pointsListComponent = new PointsListView();

  constructor(container, pointsModel) {
    this.container = container;
    this.pointsModel = pointsModel;
  }

  init() {
    this.points = [...this.pointsModel.getPoints()];


    render(this.sortingComponent, this.container);

   
    render(this.pointsListComponent, this.container);

    const pointsListElement = this.pointsListComponent.element;


    const newPoint = {
      id: 'new',
      type: 'flight',
      basePrice: 0,
      dateFrom: new Date().toISOString(),
      dateTo: new Date().toISOString(),
      destination: this.pointsModel.getDestinations()[0].id,
      isFavorite: false,
      offers: []
    };

    render(new PointEditFormView({
      point: newPoint,
      offers: this.pointsModel.getOffersByType(newPoint.type),
      checkedOffers: [],
      destination: this.pointsModel.getDestinationById(newPoint.destination),
      isNew: true
    }), pointsListElement);


    this.points.forEach((point) => {
      render(new PointView({
        point: point,
        offers: this.pointsModel.getOffersById(point.type, point.offers),
        destination: this.pointsModel.getDestinationById(point.destination)
      }), pointsListElement);
    });
  }
}
