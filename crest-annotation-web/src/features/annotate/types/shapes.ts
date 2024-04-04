import { ReactElement } from "react";
import { ShapeConfig } from "konva/lib/Shape";

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

/// Callbacks provided to a shape component
export type ShapeCallbacks = {
  // shape wants to change the cursor appearance
  onRequestCursor?: (cursor: string | undefined) => void;
  // shape wants to update itself
  onUpdate?: (data: unknown) => void;
  // shape was clicked directly
  onClick?: () => void;
};

/// Properties provided to a shape component
export type ShapeProps<T extends Shape> = {
  identifier: string;
  shape: T;
  editable?: boolean;
  selected?: boolean;
  transparent?: boolean;

  // properties passed to Konva components
  shapeConfig?: ShapeConfig;
  editingPointConfig?: ShapeConfig;
} & ShapeCallbacks;

/// Renders a shape component
export type ShapeFC<T extends Shape> = (props: ShapeProps<T>) => ReactElement;
