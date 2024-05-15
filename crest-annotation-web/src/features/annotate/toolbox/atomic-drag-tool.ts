import { createToolThunk } from "./custom-tool";
import {
  RootOperation,
  operationBegin,
  operationCancel,
  operationUpdate,
} from "../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../types/events";
import { ToolGesturePayload, ToolThunk } from "../types/thunks";

export type AtomicDragToolStartThunk<T extends RootOperation> = (
  gesture: GestureEvent
) => T["state"];
export type AtomicDragToolMoveThunk<T extends RootOperation> = (
  gesture: GestureEvent,
  state: T["state"]
) => T["state"];
export type AtomicDragToolEndThunk<T extends RootOperation> = (
  gesture: GestureEvent,
  state: T["state"]
) => T["state"];

// creates a gesture thunk that uses a single drag gesture to emit a shape
export const createAtomicDragTool = <
  O extends RootOperation & { state: { labeling?: boolean } }
>(options: {
  operation: O["type"];
  start: AtomicDragToolStartThunk<O>;
  move: AtomicDragToolMoveThunk<O>;
  end: AtomicDragToolEndThunk<O>;
}): ToolThunk<ToolGesturePayload> =>
  createToolThunk<ToolGesturePayload, O>(
    { operation: options.operation },
    ({ gesture }, operation, { dispatch }, { requestLabel, cancelLabel }) => {
      if (gesture.identifier === GestureIdentifier.Click)
        if (operation?.state.labeling)
          // labeling process is can be canceled by clicking
          return dispatch(operationCancel(operation));

      if (gesture.identifier === GestureIdentifier.DragStart) {
        // start a new process when drag gestures begins
        if (gesture.overload === GestureOverload.Primary)
          return dispatch(
            operationBegin({
              type: options.operation,
              state: options.start(gesture),
            })
          );
      }

      if (gesture.identifier === GestureIdentifier.DragMove) {
        if (operation === undefined) return;
        if (gesture.overload !== GestureOverload.Primary)
          return dispatch(operationCancel(operation));

        const update: O = {
          ...operation,
          state: options.move(gesture, operation.state),
        };

        // resume with ongoing drag gesture
        return dispatch(operationUpdate(update));
      }

      if (gesture.identifier === GestureIdentifier.DragEnd) {
        if (operation === undefined) return;
        if (gesture.overload !== GestureOverload.Primary)
          return dispatch(operationCancel(operation));

        const update: O = {
          ...operation,
          state: options.end(gesture, operation.state),
          cancellation: cancelLabel,
          completion: cancelLabel,
        };

        // complete ongoing drag gesture
        dispatch(operationUpdate(update));
        // request a label for the shape
        requestLabel();
      }
    }
  );
