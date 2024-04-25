import { ReactElement } from "react";
import { ShapeConfig } from "konva/lib/Shape";
import { Shape } from "./shapes";
import { Transformation } from "../../../types/geometry";

/// Properties provided to a shape component
export type PreviewProps<T> = {
  state?: T;
  transformation: Transformation;
};

/// Renders a shape component
export type PreviewFC<T = unknown> = (props: PreviewProps<T>) => ReactElement;

/// Properties provided to a shape component
export type ConfigProps<T> = {
  info?: T;
};

/// Renders a shape component
export type ConfigFC<T = unknown> = (props: ConfigProps<T>) => ReactElement;

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
  // solid color for some shapes
  solidColor?: string;
} & ShapeCallbacks;

/// Renders a shape component
export type ShapeFC<T extends Shape = Shape> = (
  props: ShapeProps<T>
) => ReactElement;
