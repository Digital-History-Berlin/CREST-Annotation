import Konva from "konva";
import { ShapeConfig } from "konva/lib/Shape";
import { Annotation, Shape } from "../../slice";

export type Transformation = {
  (position: Position): Position | undefined;
  (position: Position, stage: Konva.Stage): Position;
};

export interface Position {
  x: number;
  y: number;
}

export interface ShapeProps {
  annotation: Annotation;
  shapeConfig: ShapeConfig;
  color: string;
  editing: boolean;
  onRequestCursor?: (cursor: string | undefined) => void;
  onUpdate?: (annotation: Annotation) => void;
  transformation: Transformation;
}

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
