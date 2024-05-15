import { useAppSelector } from "../../../app/hooks";
import { RootOperation } from "../slice/operation";
import { Tool } from "../types/toolbox";

/// Shorthand to select from specific tool state
export const useToolStateSelector = <T, S>(
  tool: Tool,
  selector: (state: T | undefined) => S
) => {
  return useAppSelector((state) =>
    selector(state.toolbox.tools[tool] as T | undefined)
  );
};

/// Shorthand to select constrained operation state
export const useToolOperationState = <T extends RootOperation>(
  operation: T["type"]
): T["state"] | undefined => {
  return useAppSelector((state) =>
    state.operation.current?.type === operation
      ? state.operation.current.state
      : undefined
  );
};
