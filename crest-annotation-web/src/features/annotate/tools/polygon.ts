import { v4 as uuidv4 } from "uuid";
import { ToolThunk } from "../hooks/use-tool-controller";
import { ToolboxThunk } from "../hooks/use-toolbox-controller";
import { addAnnotation } from "../slice/annotations";
import { setActiveTool } from "../slice/tools";
import { GestureIdentifier, GestureOverload } from "../types/events";
import { ShapeType } from "../types/shapes";
import {
  ToolActivatePayload,
  ToolGesturePayload,
  ToolGestureThunk,
  ToolLabelPayload,
  ToolThunks,
} from "../types/thunks";
import { Tool } from "../types/tools";

const activate: ToolboxThunk<ToolActivatePayload> = (
  payload,
  { cancel },
  { dispatch }
) => {
  cancel();
  // tool can be activated immediately
  dispatch(setActiveTool(Tool.Polygon));
};

const closePolygon: ToolGestureThunk = (
  gesture,
  { operation, state, update },
  { requestLabel, cancelLabel }
) => {
  if (operation === undefined) throw new Error("Invalid operation");
  if (state?.tool !== Tool.Polygon) throw new Error("Invalid state");

  update(
    {
      ...state,
      shape: { ...state.shape, closed: true },
      preview: undefined,
      labeling: true,
    },
    {
      ...operation,
      // register cleanup
      cancellation: cancelLabel,
      finalization: cancelLabel,
    }
  );

  requestLabel();
};

const primaryClick: ToolGestureThunk = (gesture, operation, callbacks) => {
  const {
    transformation,
    transformed: { x, y },
  } = gesture;
  const { state, begin, update, cancel } = operation;

  if (state === undefined)
    return begin({
      tool: Tool.Polygon,
      // create new shape
      shape: {
        type: ShapeType.Polygon,
        points: [x, y],
        closed: false,
      },
      preview: [x, y],
    });

  if (operation === undefined) throw new Error("Invalid operation");
  if (state?.tool !== Tool.Polygon) throw new Error("Invalid state");
  if (state.labeling) return cancel();

  // finish on click near start
  const dx = state?.shape.points[0] - x;
  const dy = state.shape.points[1] - y;
  const threshold = 5 / transformation.scale;
  if (dx * dx + dy * dy < threshold * threshold)
    return closePolygon(gesture, operation, callbacks);

  // append new point
  return update(
    {
      ...state,
      // change existing shape
      shape: {
        ...state.shape,
        points: [...state.shape.points, x, y],
      },
    },
    operation.operation
  );
};

const move: ToolGestureThunk = (
  { transformed: { x, y } },
  { operation, state, update }
) => {
  if (operation === undefined) throw new Error("Invalid operation");
  if (state?.tool !== Tool.Polygon) throw new Error("Invalid state");
  if (state.labeling) return;

  return update(
    {
      ...state,
      preview: [x, y],
    },
    operation
  );
};

export const gesture: ToolThunk<ToolGesturePayload> = (
  { gesture },
  controller,
  callbacks
) => {
  if (gesture.identifier === GestureIdentifier.Click) {
    switch (gesture.overload) {
      case GestureOverload.Primary:
        return primaryClick(gesture, controller, callbacks);
      case GestureOverload.Secondary:
        return closePolygon(gesture, controller, callbacks);
      case GestureOverload.Tertiary:
        return controller.cancel();
    }
  }
  if (gesture.identifier === GestureIdentifier.Move)
    return move(gesture, controller, callbacks);
};

export const label: ToolThunk<ToolLabelPayload> = (
  { label },
  { operation, state, complete, cancel },
  { dispatch }
) => {
  if (state?.tool !== Tool.Polygon) throw new Error("Invalid state");
  if (label === undefined) return cancel();

  complete(operation);
  // create a new annotation with shape
  dispatch(
    addAnnotation({
      id: uuidv4(),
      shapes: [state.shape],
      label,
    })
  );
};

export const polygonThunks: ToolThunks = {
  activate,
  gesture,
  label,
};
