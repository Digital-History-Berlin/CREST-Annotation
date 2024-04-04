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
  dispatch(setActiveTool(Tool.Pen));
};

const dragStart: ToolGestureThunk = (
  { overload, transformed: { x, y } },
  { begin }
) => {
  if (overload !== GestureOverload.Primary) return;

  begin({
    tool: Tool.Pen,
    // create new shape
    shape: {
      type: ShapeType.Line,
      points: [x, y],
      closed: false,
    },
    labeling: false,
  });
};

const dragMove: ToolGestureThunk = (
  { overload, transformed: { x, y } },
  { operation, state, update }
) => {
  if (overload !== GestureOverload.Primary) return;

  if (operation === undefined) throw new Error("Invalid operation");
  if (state?.tool !== Tool.Pen) throw new Error("Invalid state");
  if (state.labeling) return;

  update(
    {
      ...state,
      // change existing shape
      shape: {
        ...state.shape,
        points: [...state.shape.points, x, y],
      },
    },
    operation
  );
};

const dragEnd: ToolGestureThunk = (
  gesture,
  { operation, state, update },
  { requestLabel, cancelLabel }
) => {
  if (operation === undefined) throw new Error("Invalid operation");
  if (state?.tool !== Tool.Pen) throw new Error("Invalid state");
  if (state.labeling) return;

  update(
    { ...state, labeling: true },
    {
      ...operation,
      // register cleanup
      cancellation: cancelLabel,
      finalization: cancelLabel,
    }
  );

  requestLabel();
};

export const gesture: ToolThunk<ToolGesturePayload> = (
  { gesture },
  controller,
  callbacks
) => {
  if (gesture.identifier === GestureIdentifier.Click)
    if (controller.state?.labeling) controller.cancel();

  if (gesture.identifier === GestureIdentifier.DragStart)
    return dragStart(gesture, controller, callbacks);
  if (gesture.identifier === GestureIdentifier.DragMove)
    return dragMove(gesture, controller, callbacks);
  if (gesture.identifier === GestureIdentifier.DragEnd)
    return dragEnd(gesture, controller, callbacks);
};

export const label: ToolThunk<ToolLabelPayload> = (
  { label },
  { operation, state, complete, cancel },
  { dispatch }
) => {
  if (state?.tool !== Tool.Pen) throw new Error("Invalid state");
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

export const penThunks: ToolThunks = {
  activate,
  gesture,
  label,
};
