import { v4 as uuidv4 } from "uuid";
import { PolygonShape } from "../components/shapes/Polygon";
import {
  Operation,
  OperationController,
} from "../hooks/use-operation-controller";
import { addAnnotation } from "../slice/annotations";
import { setActiveTool } from "../slice/tools";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../types/events";
import { ShapeType } from "../types/shapes";
import {
  ToolActivatePayload,
  ToolGesturePayload,
  ToolLabelPayload,
  ToolThunk,
  ToolThunkCallbacks,
  ToolThunkManage,
  ToolThunks,
} from "../types/thunks";
import { Tool } from "../types/tools";

export interface PolygonOperation extends Operation {
  shape: PolygonShape;
  // additional operation state
  preview?: [number, number];
  finished: boolean;
}

type PolygonGestureThunk = (
  gesture: GestureEvent,
  controller: OperationController<PolygonOperation>,
  callbacks: ToolThunkCallbacks
) => void;

const activate: ToolThunkManage<ToolActivatePayload, PolygonOperation> = (
  payload,
  { cancel },
  { dispatch }
) => {
  cancel();
  // tool can be activated immediately
  dispatch(setActiveTool(Tool.Polygon));
};

const closePolygon: PolygonGestureThunk = (
  gesture,
  { state, update },
  { requestLabel, cancelLabel }
) => {
  if (state?.shape === undefined) throw new Error("Invalid state");
  if (state.finished) return;

  update({
    ...state,
    shape: state.shape,
    preview: undefined,
    finished: true,
    // register label request cancellation
    cancellation: cancelLabel,
  });

  requestLabel();
};

const primaryClick: PolygonGestureThunk = (gesture, controller, callbacks) => {
  const {
    transformation,
    transformed: { x, y },
  } = gesture;
  const { state, begin, update } = controller;

  if (state === undefined)
    return begin((id) => ({
      id,
      // create new shape
      shape: {
        type: ShapeType.Polygon,
        points: [x, y],
        closed: false,
      },
      preview: [x, y],
      finished: false,
    }));

  // finish on click near start
  const dx = state?.shape.points[0] - x;
  const dy = state.shape.points[1] - y;
  const threshold = 5 / transformation.scale;
  if (dx * dx + dy * dy < threshold * threshold)
    return closePolygon(gesture, controller, callbacks);

  // append new point
  return update({
    ...state,
    // change existing shape
    shape: {
      ...state.shape,
      points: [...state.shape.points, x, y],
    },
  });
};

const move: PolygonGestureThunk = (
  { transformed: { x, y } },
  { state, update }
) => {
  if (state === undefined) return;

  return update({
    ...state,
    preview: [x, y],
  });
};

export const gesture: ToolThunk<ToolGesturePayload, PolygonOperation> = (
  { gesture },
  controller,
  callbacks
) => {
  if (gesture.identifier === GestureIdentifier.Click)
    switch (gesture.overload) {
      case GestureOverload.Primary:
        return primaryClick(gesture, controller, callbacks);
      case GestureOverload.Secondary:
        return closePolygon(gesture, controller, callbacks);
      case GestureOverload.Tertiary:
        return controller.cancel();
    }
  if (gesture.identifier === GestureIdentifier.Move)
    return move(gesture, controller, callbacks);
};

export const label: ToolThunk<ToolLabelPayload, PolygonOperation> = (
  { label },
  { state, complete },
  { dispatch }
) => {
  if (state?.shape === undefined) throw new Error("Invalid state");

  complete(state);
  // create a new annotation with shape
  dispatch(
    addAnnotation({
      id: uuidv4(),
      shapes: [state.shape],
      label,
    })
  );
};

export const polygonThunks: ToolThunks<PolygonOperation> = {
  activate,
  gesture,
  label,
};
