import { useMemo } from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectorsRegistry } from "../toolbox";
import { Tool, ToolInfo, ToolStatus } from "../types/toolbox";

export type ToolInfoWithTool = ToolInfo & { tool: Tool; status: ToolStatus };

/**
 * Select tool info for registered tools
 */
export const useToolInfo = () => {
  // request the available tool states
  const tools = useAppSelector((state) => state.toolbox.tools);

  return useMemo(
    () =>
      Object.entries(tools)
        .map(([tool, state]) => {
          if (!(tool in selectorsRegistry)) return undefined;
          // select details from tool state
          const selectors = selectorsRegistry[tool as Tool];
          const info = selectors.info(state);
          const status = selectors.status(state);
          // return combined state
          return { ...info, status, tool };
        })
        .filter((info): info is ToolInfoWithTool => info !== undefined),
    [tools]
  );
};
