import { mockPoints } from '../mock/points.js';

export default class PointsModel {
  #points = [];

  constructor() {
    this.#points = [...mockPoints];
  }

  getPoints() {
    return this.#points;
  }

  deletePoint(pointId) {
    try {
      this.#points = this.#points.filter(point => point.id !== pointId);
      return this.#points;
    } catch (error) {
      console.error('Error deleting point:', error);
      throw error;
    }
  }

  updatePoint(updatedPoint) {
    try {
      const index = this.#points.findIndex(point => point.id === updatedPoint.id);
      if (index !== -1) {
        this.#points[index] = { ...this.#points[index], ...updatedPoint };
      } else {
        console.warn(`Point with id ${updatedPoint.id} not found for update`);
      }
      return this.#points;
    } catch (error) {
      console.error('Error updating point:', error);
      throw error;
    }
  }

  addPoint(newPoint) {
    try {
      this.#points.push(newPoint);
      return this.#points;
    } catch (error) {
      console.error('Error adding point:', error);
      throw error;
    }
  }
}
