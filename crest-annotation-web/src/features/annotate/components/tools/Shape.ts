import Konva from "konva";
import { ShapeConfig } from "konva/lib/Shape";
import { Shape } from "../../slice";

export type Transformation = {
  (position: Position): Position | undefined;
  (position: Position, stage: Konva.Stage): Position;
};

export interface Position {
  x: number;
  y: number;
}

/// Properties provided to a shape component
export interface ShapeProps {
  identifier: string;
  shape: Shape;
  color: string;
  editing: boolean;

  // properties passed to child components
  shapeConfig?: ShapeConfig;
  editingPointConfig?: ShapeConfig;

  // shape wants to change the cursor appearance
  onRequestCursor?: (cursor: string | undefined) => void;
  // shape wants to update itself
  onUpdate?: (shape: Shape) => void;

  // allows to retrieve the cursor position relative to the canvas
  getTransformedPointerPosition: (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => Position | undefined;
}

/// Combines a shape component with additional properties
export interface ShapeTool {
  component: (props: ShapeProps) => React.ReactElement;
  onCreate: (position: Position) => Shape;

  onDown?: (shape: Shape, position: Position) => Shape | undefined;
  onMove?: (shape: Shape, position: Position) => Shape | undefined;
  onUp?: (shape: Shape, position: Position) => Shape | undefined;

  onKeyDown?: (
    shape: Shape,
    event: React.KeyboardEvent<HTMLDivElement>
  ) => Shape | undefined;
}
