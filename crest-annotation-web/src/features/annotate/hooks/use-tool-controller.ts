import { useCallback, useMemo } from "react";
import { ToolboxOperationState, useRegistry } from "./use-registry";
import {
  ToolboxCallbacks,
  ToolboxController,
  ToolboxOperationController,
} from "./use-toolbox-controller";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectActiveTool } from "../slice/tools";
import { GestureEvent } from "../types/events";
import { Shape } from "../types/shapes";

export type ToolCallbacks = ToolboxCallbacks & {
  requestLabel: () => void;
  cancelLabel: () => void;
  emitShape: (shape: Shape) => void;
};

export type ToolThunk<P> = (
  payload: P,
  operation: ToolboxOperationController,
  callbacks: ToolCallbacks
) => void;

export interface ToolController {
  state: ToolboxOperationState;
  /// Handle a gesture event
  handleGesture: (gesture: GestureEvent) => void;
  /// Handle a label selection
  handleLabel: (label?: Label) => void;
}

/**
 * Provide tool logic
 *
 * The tool controller provides methods to handle gestures and labels.
 * It will delegate the events to the corresponding tool thunks.
 */
export const useToolController = (options: {
  toolbox: ToolboxController;
  requestLabel: () => void;
  cancelLabel: () => void;
}): ToolController => {
  const { operation } = options.toolbox;
  const dispatch = useAppDispatch();
  const registry = useRegistry();
  const tool = useAppSelector(selectActiveTool);

  // callbacks for tool thunks
  const callbacks = useMemo(
    () => ({
      requestLabel: options.requestLabel,
      cancelLabel: options.cancelLabel,
      emitShape: (shape: Shape) => {
        return shape;
      },
      dispatch,
    }),
    [options, dispatch]
  );

  const handleGesture = useCallback(
    (gesture: GestureEvent) => {
      const thunks = registry.thunksRegistry[tool];
      thunks?.gesture?.({ gesture }, operation, callbacks);
    },
    [registry, tool, operation, callbacks]
  );

  const handleLabel = useCallback(
    (label?: Label) => {
      console.debug("Label received: ", label);

      const thunks = registry.thunksRegistry[tool];
      thunks?.label?.({ label }, operation, callbacks);
    },
    [registry, tool, operation, callbacks]
  );

  return {
    state: operation.state,
    handleGesture,
    handleLabel,
  };
};
