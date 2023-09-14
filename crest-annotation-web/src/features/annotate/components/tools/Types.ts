import { ReactElement } from "react";
import { ShapeConfig } from "konva/lib/Shape";
import { Object as DataObject } from "../../../../api/openApi";
import { AppDispatch, RootState } from "../../../../app/store";
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
  callback: (shape: Shape) => void,
  config: unknown
) => Shape | undefined | void;

export type ShapeToolEvent = {
  projectId: string;
  object: DataObject;
  image: string;
};

/// Combines a shape component with gesture event handlers
export type ShapeTool = {
  component: (props: ShapeProps) => ReactElement;
  onBegin?: (
    event: ShapeToolEvent,
    // provide additional tools during config
    api: {
      dispatch: AppDispatch;
      getState: () => RootState;
    }
  ) => MaybePromise<unknown>;
} & Partial<Record<keyof GestureEvents, ShapeEventHandler>>;
