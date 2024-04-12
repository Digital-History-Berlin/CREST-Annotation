import { useMemo } from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectorsRegistry } from "../toolbox";
import { Tool, ToolInfo } from "../types/toolbox";

export type ToolInfoWithTool = ToolInfo & { tool: Tool };

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
          // select the tool info from tool state
          const info =
            selectorsRegistry[tool as keyof typeof selectorsRegistry]?.info?.(
              state
            );
          // append tool name to the info
          return { ...info, tool };
        })
        .filter((info): info is ToolInfoWithTool => info !== undefined),
    [tools]
  );
};
