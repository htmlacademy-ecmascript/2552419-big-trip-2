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
      const initialLength = this.#points.length;
      this.#points = this.#points.filter(point => point.id !== pointId);

      if (this.#points.length === initialLength) {
        throw new Error(`Point with id ${pointId} not found`);
      }

      return this.#points;
    } catch (error) {
      console.error('Error deleting point:', error);
      throw error;
    }
  }

  updatePoint(updatedPoint) {
    try {
      const index = this.#points.findIndex(point => point.id === updatedPoint.id);
      if (index === -1) {
        throw new Error(`Point with id ${updatedPoint.id} not found`);
      }

      this.#points[index] = { ...this.#points[index], ...updatedPoint };
      return this.#points;
    } catch (error) {
      console.error('Error updating point:', error);
      throw error;
    }
  }

  addPoint(newPoint) {
    try {
      const newId = Math.max(...this.#points.map(p => parseInt(p.id)), 0) + 1;
      const pointWithId = {
        ...newPoint,
        id: newId.toString()
      };

      this.#points.push(pointWithId);
      return this.#points;
    } catch (error) {
      console.error('Error adding point:', error);
      throw error;
    }
  }
}
