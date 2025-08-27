import { Point } from './point';

/// Represents a geometric area defined by a set of points.
export class Area {
  constructor(public points: Point[]) {}

  /// Checks if a point is inside the area.
  /// using the ray-casting algorithm
  /// that counts how many times a horizontal ray from the point intersects the edges of the polygon.
  /// If the count is odd, the point is inside; if even, it's outside.
  containsPoint(point: Point): boolean {
    const intersectsEdge = (point: Point, edgeStart: Point, edgeEnd: Point) =>
      edgeStart.y > point.y !== edgeEnd.y > point.y &&
      point.x <
        ((edgeEnd.x - edgeStart.x) * (point.y - edgeStart.y)) /
          (edgeEnd.y - edgeStart.y) +
          edgeStart.x;

    let inside = false;
    const n = this.points.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const edgeStart = this.points[i];
      const edgeEnd = this.points[j];
      if (intersectsEdge(point, edgeStart, edgeEnd)) inside = !inside;
    }
    return inside;
  }
}
