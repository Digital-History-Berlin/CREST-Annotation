import { ReactElement } from "react";
import { ShapeConfig } from "konva/lib/Shape";
import { Shape } from "../../slice/annotations";
import { GestureEvent, GestureEvents } from "../types/Events";

/// Callbacks provided to a shape component
export type ShapeCallbacks = {
  // shape wants to change the cursor appearance
  onRequestCursor?: (cursor: string | undefined) => void;
  // shape wants to update itself
  onUpdate?: (shape: Shape) => void;
  // shape was clicked directly
  onClick?: () => void;
};

/// Properties provided to a shape component
export type ShapeProps = {
  identifier: string;
  shape: Shape;
  color: string;
  editable?: boolean;
  selected?: boolean;

  // properties passed to Konva components
  shapeConfig?: ShapeConfig;
  editingPointConfig?: ShapeConfig;
} & ShapeCallbacks;

/// Event handler for gesture events
export type ShapeEventHandler = (
  shape: Shape | undefined,
  event: GestureEvent
) => void;

/// Combines a shape component with gesture event handlers
export type ShapeTool = {
  component: (props: ShapeProps) => ReactElement;
} & Partial<Record<keyof GestureEvents, ShapeEventHandler>>;
