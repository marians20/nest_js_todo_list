/* eslint-disable prettier/prettier */
import { Area } from './area';
import { Point } from './point';

describe('Area', () => {
  describe('containsPoint', () => {
    it('should return true for a point inside a simple square', () => {
      // Create a square with corners at (0,0), (4,0), (4,4), (0,4)
      const square = new Area([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4),
      ]);

      // Test point in the center
      expect(square.containsPoint(new Point(2, 2))).toBe(true);

      // Test other points inside
      expect(square.containsPoint(new Point(1, 1))).toBe(true);
      expect(square.containsPoint(new Point(3, 3))).toBe(true);
      expect(square.containsPoint(new Point(0.5, 2))).toBe(true);
    });

    it('should return false for a point outside a simple square', () => {
      const square = new Area([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4),
      ]);

      // Test points clearly outside
      expect(square.containsPoint(new Point(5, 2))).toBe(false);
      expect(square.containsPoint(new Point(-1, 2))).toBe(false);
      expect(square.containsPoint(new Point(2, 5))).toBe(false);
      expect(square.containsPoint(new Point(2, -1))).toBe(false);
      
      // Test points in corners outside
      expect(square.containsPoint(new Point(5, 5))).toBe(false);
      expect(square.containsPoint(new Point(-1, -1))).toBe(false);
    });

    it('should handle points on the boundary correctly', () => {
      const square = new Area([
        new Point(0, 0),
        new Point(4, 0),
        new Point(4, 4),
        new Point(0, 4),
      ]);

      // Points on edges - the ray casting algorithm's behavior for boundary points
      // depends on the implementation details. These tests document the actual behavior.
      expect(square.containsPoint(new Point(2, 0))).toBe(true); // bottom edge
      expect(square.containsPoint(new Point(4, 2))).toBe(false); // right edge
      expect(square.containsPoint(new Point(2, 4))).toBe(false); // top edge
      expect(square.containsPoint(new Point(0, 2))).toBe(true); // left edge
      
      // Vertices - behavior may vary at vertices
      expect(square.containsPoint(new Point(0, 0))).toBe(true);
      expect(square.containsPoint(new Point(4, 0))).toBe(false);
      expect(square.containsPoint(new Point(4, 4))).toBe(false);
      expect(square.containsPoint(new Point(0, 4))).toBe(false);
    });

    it('should work with a triangle', () => {
      // Create a triangle with vertices at (0,0), (4,0), (2,3)
      const triangle = new Area([
        new Point(0, 0),
        new Point(4, 0),
        new Point(2, 3),
      ]);

      // Point inside triangle
      expect(triangle.containsPoint(new Point(2, 1))).toBe(true);
      expect(triangle.containsPoint(new Point(1.5, 1.5))).toBe(true);
      
      // Points outside triangle
      expect(triangle.containsPoint(new Point(0, 1))).toBe(false);
      expect(triangle.containsPoint(new Point(4, 1))).toBe(false);
      expect(triangle.containsPoint(new Point(2, 4))).toBe(false);
      expect(triangle.containsPoint(new Point(-1, 0))).toBe(false);
    });

    it('should work with a concave polygon (L-shape)', () => {
      // Create an L-shaped polygon
      const lShape = new Area([
        new Point(0, 0),
        new Point(3, 0),
        new Point(3, 1),
        new Point(1, 1),
        new Point(1, 3),
        new Point(0, 3),
      ]);

      // Points inside the L-shape
      expect(lShape.containsPoint(new Point(0.5, 0.5))).toBe(true); // bottom part
      expect(lShape.containsPoint(new Point(2, 0.5))).toBe(true); // bottom part
      expect(lShape.containsPoint(new Point(0.5, 2))).toBe(true); // vertical part
      
      // Points in the "notch" of the L (should be outside)
      expect(lShape.containsPoint(new Point(2, 2))).toBe(false);
      expect(lShape.containsPoint(new Point(2.5, 1.5))).toBe(false);
      
      // Points clearly outside
      expect(lShape.containsPoint(new Point(4, 0.5))).toBe(false);
      expect(lShape.containsPoint(new Point(0.5, 4))).toBe(false);
      expect(lShape.containsPoint(new Point(-1, 1))).toBe(false);
    });

    it('should work with a complex polygon with many vertices', () => {
      // Create a hexagon
      const hexagon = new Area([
        new Point(2, 0), // bottom
        new Point(4, 1), // bottom-right
        new Point(4, 3), // top-right
        new Point(2, 4), // top
        new Point(0, 3), // top-left
        new Point(0, 1), // bottom-left
      ]);

      // Point in center
      expect(hexagon.containsPoint(new Point(2, 2))).toBe(true);
      
      // Points near edges but inside
      expect(hexagon.containsPoint(new Point(1, 1.5))).toBe(true);
      expect(hexagon.containsPoint(new Point(3, 2.5))).toBe(true);
      
      // Points outside
      expect(hexagon.containsPoint(new Point(2, 5))).toBe(false);
      expect(hexagon.containsPoint(new Point(5, 2))).toBe(false);
      expect(hexagon.containsPoint(new Point(-1, 2))).toBe(false);
    });

    it('should handle edge cases with floating point coordinates', () => {
      const square = new Area([
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1),
        new Point(0, 1),
      ]);

      // Floating point coordinates
      expect(square.containsPoint(new Point(0.5, 0.5))).toBe(true);
      expect(square.containsPoint(new Point(0.1, 0.9))).toBe(true);
      expect(square.containsPoint(new Point(0.999, 0.999))).toBe(true);
      
      // Just outside with floating point
      expect(square.containsPoint(new Point(1.001, 0.5))).toBe(false);
      expect(square.containsPoint(new Point(0.5, 1.001))).toBe(false);
      expect(square.containsPoint(new Point(-0.001, 0.5))).toBe(false);
    });

    it('should handle a single point polygon', () => {
      // Degenerate case - single point
      const singlePoint = new Area([new Point(1, 1)]);
      
      // The point itself and nearby points should be outside
      // (a single point has no area)
      expect(singlePoint.containsPoint(new Point(1, 1))).toBe(false);
      expect(singlePoint.containsPoint(new Point(0.9, 1))).toBe(false);
      expect(singlePoint.containsPoint(new Point(1.1, 1))).toBe(false);
    });

    it('should handle a line segment (two points)', () => {
      // Degenerate case - line segment
      const line = new Area([new Point(0, 0), new Point(2, 0)]);
      
      // Points on or near the line should be outside (no area)
      expect(line.containsPoint(new Point(1, 0))).toBe(false);
      expect(line.containsPoint(new Point(0, 0))).toBe(false);
      expect(line.containsPoint(new Point(2, 0))).toBe(false);
      expect(line.containsPoint(new Point(1, 0.1))).toBe(false);
    });

    it('should work with negative coordinates', () => {
      const square = new Area([
        new Point(-2, -2),
        new Point(2, -2),
        new Point(2, 2),
        new Point(-2, 2),
      ]);

      // Points inside
      expect(square.containsPoint(new Point(0, 0))).toBe(true);
      expect(square.containsPoint(new Point(-1, 1))).toBe(true);
      expect(square.containsPoint(new Point(1, -1))).toBe(true);
      
      // Points outside
      expect(square.containsPoint(new Point(3, 0))).toBe(false);
      expect(square.containsPoint(new Point(0, 3))).toBe(false);
      expect(square.containsPoint(new Point(-3, 0))).toBe(false);
      expect(square.containsPoint(new Point(0, -3))).toBe(false);
    });
  });
});
