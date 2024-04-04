import { useCallback } from "react";
import {
  OperationController,
  useOperationController,
} from "./use-operation-controller";
import { ToolboxOperationState, useRegistry } from "./use-registry";
import { useAppDispatch } from "../../../app/hooks";
import { AppDispatch, store } from "../../../app/store";
import { Tool } from "../types/tools";

export type ToolboxOperationController =
  OperationController<ToolboxOperationState>;

export interface ToolboxCallbacks {
  // direct access to dispatch
  dispatch: AppDispatch;
}

export type ToolboxThunk<P> = (
  payload: P,
  operation: ToolboxOperationController,
  callbacks: ToolboxCallbacks
) => void;

export interface ToolboxController {
  operation: ToolboxOperationController;
  /// Activate the given tool
  handleActivate: (tool: Tool) => void;
}

/**
 * Provides the toolbox logic
 *
 * The toolbox controller provides methods to activate tools and manage their state.
 * It will delegate the tool events to the corresponding tool controller.
 * It is also responsible for modifiers.
 *
 * The toolbox controller does not handle the annotation process.
 */
export const useToolboxController = (): ToolboxController => {
  const dispatch = useAppDispatch();
  const registry = useRegistry();
  const operation = useOperationController<ToolboxOperationState>(undefined);

  const handleActivate = useCallback(
    (tool: Tool) => {
      console.debug("Activate tool: ", tool);

      const { tools } = store.getState();
      const config = tools[tool].config;
      const thunks = registry.thunksRegistry[tool];
      thunks?.activate?.({ config }, operation, { dispatch });
    },
    [dispatch, registry, operation]
  );

  return {
    operation,
    handleActivate,
  };
};
