import { ReactElement } from "react";
import { ShapeConfig } from "konva/lib/Shape";
import { Object as DataObject, Project } from "../../../../api/openApi";
import { GestureEvent, GestureEvents } from "../../../../types/Events";
import { MaybePromise } from "../../../../types/MaybePromise";
import { ActionSequenceState } from "../../hooks/use-action-stream";
import { Shape } from "../../slice/annotations";
import { Tool } from "../../slice/tools";

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
) => MaybePromise<ActionSequenceState<Shape>>;

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

/// A gesture handle received an invalid state
export class ShapeGestureError extends Error {
  public constructor(reason: string) {
    super(`Failed to handle gesture: ${reason}`);
  }
}

/// Helper to cast and validate a shape
export const assertTool = <T>(
  shape: Shape | undefined,
  tool: Tool
): T & { tool: Tool } => {
  if (shape === undefined) throw new ShapeGestureError("Missing shape");
  if (shape.tool !== tool) throw new ShapeGestureError("Incorrect shape");
  return shape as unknown as T & { tool: Tool };
};
