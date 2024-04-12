import { Tool, ToolGroup } from "../../types/toolbox";
import { createActivateThunk, createToolSelectors } from "../custom-tool";

const activate = createActivateThunk({ tool: Tool.Edit });

export const editThunks = {
  activate,
};

export const editSelectors = createToolSelectors({
  tool: Tool.Edit,
  group: ToolGroup.Edit,
  icon: {
    name: "mdi:vector-polyline-edit",
    style: { fontSize: "25px" },
    tooltip: "Edit",
  },
});
