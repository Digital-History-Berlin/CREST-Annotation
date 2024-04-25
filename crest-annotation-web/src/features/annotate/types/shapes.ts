/// Identifies a shape
export enum ShapeType {
  Line = "Line",
  Circle = "Circle",
  Rectangle = "Rectangle",
  Polygon = "Polygon",
  Mask = "Mask",
}

/// Base class for all shapes
export type Shape = {
  type: ShapeType;
};

/// A shape with unknown properties
export type UnknownShape = Shape & { [key: string]: unknown };
