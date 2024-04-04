import { v4 as uuidv4 } from "uuid";
import { LineShape } from "../components/shapes/Line";
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

export interface PenOperation extends Operation {
  shape: LineShape;
  // additional operation state
  finished?: boolean;
}

type PenGestureThunk = (
  gesture: GestureEvent,
  controller: OperationController<PenOperation>,
  callbacks: ToolThunkCallbacks
) => void;

const activate: ToolThunkManage<ToolActivatePayload, PenOperation> = (
  payload,
  { cancel },
  { dispatch }
) => {
  cancel();
  // tool can be activated immediately
  dispatch(setActiveTool(Tool.Pen));
};

const dragStart: PenGestureThunk = (
  { overload, transformed: { x, y } },
  { begin }
) => {
  if (overload !== GestureOverload.Primary) return;

  begin((id) => ({
    id,
    // create new shape
    shape: {
      type: ShapeType.Line,
      points: [x, y],
      closed: false,
    },
    finished: false,
  }));
};

const dragMove: PenGestureThunk = (
  { overload, transformed: { x, y } },
  { state, update }
) => {
  if (overload !== GestureOverload.Primary) return;
  if (state?.shape === undefined) throw new Error("Invalid state");
  if (state.finished) return;

  update({
    ...state,
    // change existing shape
    shape: {
      ...state.shape,
      points: [...state.shape.points, x, y],
    },
  });
};

const dragEnd: PenGestureThunk = (
  gesture,
  { state, update },
  { requestLabel, cancelLabel }
) => {
  if (state?.shape === undefined) throw new Error("Invalid state");
  if (state.finished) return;

  update({
    ...state,
    shape: state.shape,
    finished: true,
    // register label request cancellation
    cancellation: cancelLabel,
  });

  requestLabel();
};

export const gesture: ToolThunk<ToolGesturePayload, PenOperation> = (
  { gesture },
  controller,
  callbacks
) => {
  if (gesture.identifier === GestureIdentifier.DragStart)
    return dragStart(gesture, controller, callbacks);
  if (gesture.identifier === GestureIdentifier.DragMove)
    return dragMove(gesture, controller, callbacks);
  if (gesture.identifier === GestureIdentifier.DragEnd)
    return dragEnd(gesture, controller, callbacks);
};

export const label: ToolThunk<ToolLabelPayload, PenOperation> = (
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

export const penThunks: ToolThunks<PenOperation> = {
  activate,
  gesture,
  label,
};
