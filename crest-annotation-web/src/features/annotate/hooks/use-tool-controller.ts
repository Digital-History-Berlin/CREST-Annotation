import { useCallback, useMemo } from "react";
import { Operation, OperationController } from "./use-operation-controller";
import { useRegistry } from "./use-registry";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectActiveTool } from "../slice/tools";
import { GestureEvent } from "../types/events";
import { Shape } from "../types/shapes";
import { ToolThunkController, ToolThunkManager } from "../types/thunks";
import { Tool } from "../types/tools";

export const useToolManager = (options: {
  controller: OperationController<Operation>;
}): ToolThunkManager => {
  const dispatch = useAppDispatch();
  const registry = useRegistry();
  const tools = useAppSelector((state) => state.tools);

  const handleActivate = useCallback(
    (tool: Tool) => {
      console.debug("Activate tool: ", tool);

      const config = tools[tool].config;
      const thunks = registry.thunksRegistry[tool];
      thunks?.activate?.({ config }, options.controller, { dispatch });
    },
    [dispatch, registry, options, tools]
  );

  return {
    handleActivate,
  };
};

/// Redirects actions to the correct tool thunks
export const useToolController = (options: {
  controller: OperationController<Operation>;
  requestLabel: () => void;
  cancelLabel: () => void;
}): ToolThunkController => {
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
      thunks?.gesture?.({ gesture }, options.controller, callbacks);
    },
    [registry, tool, options, callbacks]
  );

  const handleLabel = useCallback(
    () => (label: Label) => {
      console.debug("Label received: ", tool);

      const thunks = registry.thunksRegistry[tool];
      thunks?.label?.({ label }, options.controller, callbacks);
    },
    [registry, tool, options, callbacks]
  );

  return {
    state: options.controller.state,
    handleGesture,
    handleLabel,
  };
};
