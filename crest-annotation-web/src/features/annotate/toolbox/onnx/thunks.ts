import { OnnxToolInfo } from "./types";
import { updateToolState } from "../../slice/toolbox";
import { ToolSelectors, ToolThunks } from "../../types/thunks";
import { Tool, ToolGroup, ToolStatus } from "../../types/toolbox";
import { createActivateThunk } from "../custom-tool";

const activate = createActivateThunk({ tool: Tool.Onnx }, ({ dispatch }) => {
  // begin initializing the tool
  dispatch(
    updateToolState({
      tool: Tool.Onnx,
      state: { status: ToolStatus.Loading },
    })
  );
});

export const onnxThunks: ToolThunks = {
  activate,
};

export const onnxSelectors: ToolSelectors<OnnxToolInfo | undefined> = {
  info: (state) => ({
    status: state?.status ?? ToolStatus.Failed,
    group: ToolGroup.Backend,
    icon: {
      name: "mdi:tensorflow",
      style: { fontSize: "25px" },
      tooltip: "ONNX",
    },
  }),
};
