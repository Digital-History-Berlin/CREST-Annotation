import { InferenceSession, Tensor } from "onnxruntime-web";
import { MaskShape } from "../../../components/shapes/Mask";
import { Operation } from "../../../types/operation";
import { Tool } from "../../../types/toolbox";
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
  "tool/cv",
  CvSamOnnxToolOperationState
>;
