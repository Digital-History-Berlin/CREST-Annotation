import { InferenceSession, Tensor } from "onnxruntime-web";

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

export interface SamToolData {
  model: InferenceSession;
  tensor: Tensor;
  dimensions: SamImageDimensions;
}
