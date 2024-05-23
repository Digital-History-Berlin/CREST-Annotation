import { useAppSelector } from "../../../app/hooks";
import { Tool } from "../types/toolbox";

/// Shorthand to access specific tool state
export const useToolState = <T>(tool: Tool): T | undefined =>
  useAppSelector((state) => state.toolbox.tools[tool] as T | undefined);

/// Shorthand to select from specific tool state
export const useToolStateSelector = <T, S>(
  tool: Tool,
  selector: (state: T | undefined) => S
) =>
  useAppSelector((state) =>
    selector(state.toolbox.tools[tool] as T | undefined)
  );
