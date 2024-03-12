import { ReactElement } from "react";
import { ShapeConfig } from "konva/lib/Shape";
import { Object as DataObject, Project } from "../../../../api/openApi";
import { GestureEvent, GestureEvents } from "../../../../types/Events";
import { MaybePromise } from "../../../../types/MaybePromise";
import { Shape } from "../../slice/annotations";

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
  transparent?: boolean;

  // properties passed to Konva components
  shapeConfig?: ShapeConfig;
  editingPointConfig?: ShapeConfig;
} & ShapeCallbacks;

/// Event handler for gesture events
export type ShapeEventHandler = (
  shape: Shape | undefined,
  event: GestureEvent,
  config: unknown
) => MaybePromise<Shape | undefined>;

export type ShapeToolEvent = {
  project: Project;
  object: DataObject;
  image: string;
};

export type ShapeToolEventHandler = (
  event: ShapeToolEvent,
  config: unknown
) => MaybePromise<unknown>;

/// Combines a shape component with gesture event handlers
export type ShapeTool = {
  component: (props: ShapeProps) => ReactElement;
  onBegin?: ShapeToolEventHandler;
} & Partial<Record<keyof GestureEvents, ShapeEventHandler>>;
