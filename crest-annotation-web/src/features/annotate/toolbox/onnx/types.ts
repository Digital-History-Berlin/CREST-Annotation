import { MaskShape } from "../../components/shapes/Mask";
import { Operation } from "../../types/operation";
import { Tool, ToolStatus } from "../../types/toolbox";

export interface OnnxToolInfo {
  status: ToolStatus;
}

export interface OnnxToolState {
  readonly tool: Tool.Onnx;
  shape: MaskShape;
  labeling?: boolean;
}

export type OnnxToolOperation = Operation<"tool/onnx", OnnxToolState>;
