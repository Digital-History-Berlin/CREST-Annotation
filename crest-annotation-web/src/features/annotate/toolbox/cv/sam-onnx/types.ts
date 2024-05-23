import { InferenceSession, Tensor } from "onnxruntime-web";
import { RootState } from "../../../../../app/store";
import { MaskShape } from "../../../components/shapes/Mask";
import { Operation, operationStateOfType } from "../../../types/operation";
import { Tool } from "../../../types/toolbox";
import { cvToolState } from "../create-cv-tool";
import { CvToolState } from "../types";

export interface SamImageDimensions {
  scale: number;
  height: number;
  width: number;
}

export interface SamClick {
  x: number;
  y: number;
  clickType: number;
}

export interface SamInput {
  clicks?: Array<SamClick>;
  tensor: Tensor;
  dimensions: SamImageDimensions;
}

export interface CvSamOnnxToolConfig {
  // TODO: add tool configuration options
  unused: undefined;
}

export interface CvSamOnnxToolData {
  model: InferenceSession;
  tensor: Tensor;
  dimensions: SamImageDimensions;
}

export type CvSamOnnxToolState = CvToolState<
  CvSamOnnxToolConfig,
  CvSamOnnxToolData
>;

export interface CvSamOnnxToolOperationState {
  readonly tool: Tool.Cv;
  shape?: MaskShape;
  labeling?: boolean;
}

export type CvSamOnnxToolOperation = Operation<
  "tool/cv/sam-onnx",
  CvSamOnnxToolOperationState
>;

// narrow down selectors to the specific tool
export const toolState = (state: RootState, ready = true) =>
  cvToolState<CvSamOnnxToolState>(
    state.toolbox.tools[Tool.Cv],
    "sam-onnx",
    ready
  );
export const operationState = (state: RootState) =>
  operationStateOfType<CvSamOnnxToolOperation>(
    state.operation.current,
    "tool/cv/sam-onnx"
  );
