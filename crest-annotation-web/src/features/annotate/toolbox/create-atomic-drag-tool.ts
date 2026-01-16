import { withCurrentOperationContext } from "./create-custom-tool";
import { selectGroupModifierState } from "./tool-modifiers";
import { updateAnnotation } from "../slice/annotations";
import { operationBegin, operationCancel } from "../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../types/events";
import { operationStateOfType } from "../types/operation";
import { AtomicToolOperation } from "../types/toolbox-operations";
import { ToolGesturePayload, ToolThunk } from "../types/toolbox-thunks";

export type AtomicDragToolStartThunk<O extends AtomicToolOperation> = (
  gesture: GestureEvent
) => O["state"];
export type AtomicDragToolMoveThunk<O extends AtomicToolOperation> = (
  gesture: GestureEvent,
  state: O["state"]
) => O["state"];
export type AtomicDragToolEndThunk<O extends AtomicToolOperation> = (
  gesture: GestureEvent,
  state: O["state"]
) => O["state"];

/**
 * Creates a gesture thunk that uses a single drag gesture to emit a shape
 *
 * Custom thunks must be provided for each part of the gesture, which
 * should update the shape accordingly.
 */
export const createAtomicDragTool =
  <O extends AtomicToolOperation>(options: {
    operation: O["type"];
    start: AtomicDragToolStartThunk<O>;
    move: AtomicDragToolMoveThunk<O>;
    end: AtomicDragToolEndThunk<O>;
  }): ToolThunk<ToolGesturePayload> =>
  async ({ gesture }, thunkApi, { requestLabel, cancelLabel }) => {
    if (gesture.identifier === GestureIdentifier.DragStart) {
      // start operation when drag gestures begins
      if (gesture.overload === GestureOverload.Primary)
        await thunkApi
          .dispatch(
            operationBegin<AtomicToolOperation>({
              operation: {
                type: options.operation,
                state: options.start(gesture),
              },
            })
          )
          .unwrap();
    }

    if (gesture.identifier === GestureIdentifier.Click) {
      const { id, current } = thunkApi.getState().operation;
      // labeling process can be canceled by clicking
      if (operationStateOfType<O>(current, options.operation)?.labeling)
        await thunkApi.dispatch(operationCancel({ id })).unwrap();
    }

    if (
      (gesture.identifier !== GestureIdentifier.DragMove &&
        gesture.identifier !== GestureIdentifier.DragEnd) ||
      gesture.overload !== GestureOverload.Primary
    )
      return;

    // remaining gesture handlers require operation
    await withCurrentOperationContext<O>(
      { thunkApi, type: options.operation },
      (contextApi) => {
        const current = contextApi.getState();

        if (gesture.identifier === GestureIdentifier.Click)
          if (current?.state.labeling)
            // labeling process can be canceled by clicking
            return contextApi.cancel();

        if (gesture.identifier === GestureIdentifier.DragMove) {
          if (gesture.overload !== GestureOverload.Primary)
            // drag process is canceled by overloaded gestures
            return contextApi.cancel();

          // update ongoing drag gesture
          return contextApi.update({
            ...current,
            state: options.move(gesture, current.state),
          });
        }

        if (gesture.identifier === GestureIdentifier.DragEnd) {
          if (gesture.overload !== GestureOverload.Primary)
            return contextApi.cancel();

          // TODO: write emitShapes() encapsulation
          const state = options.end(gesture, current.state);
          const group = selectGroupModifierState(thunkApi.getState());
          if (group)
            return void contextApi.complete().then(() => {
              thunkApi.dispatch(
                updateAnnotation({
                  ...group,
                  // append the shape to the existing group annotation
                  shapes: [...(group.shapes || []), state.shape],
                })
              );
            });

          // request a label for the shape
          return contextApi
            .update({
              ...current,
              state,
              cancellation: cancelLabel,
              completion: cancelLabel,
            })
            .then(() => requestLabel());
        }
      }
    );
  };
