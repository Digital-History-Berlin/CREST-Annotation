import { Operation } from "../../../types/operation";
import { Tool } from "../../../types/toolbox";
import { CvToolState } from "../types";

export interface SamBoundingBox {
  bbox: number[];
  predictedIou: number;
  stabilityScore: number;
}

export interface SamMask {
  mask: number[][];
}

export interface CvCrestDetectionToolConfig {
  autostart: boolean;
  skipDuplicates: boolean;
  skipCovered: boolean;
  showPixelMask: boolean;
}

export interface CvCrestDetectionToolData {
  // detected bounding boxes
  boundingBoxes?: SamBoundingBox[];
}

export type CvCrestDetectionToolState = CvToolState<
  CvCrestDetectionToolConfig,
  CvCrestDetectionToolData
>;

export interface CvCrestDetectionToolOperationState {
  readonly tool: Tool.Cv;
  readonly task?: "cv/crest-detection/select";

  index: number;
  boundingBox: SamBoundingBox;
  mask?: SamMask;
}

export type CvCrestDetectionToolOperation = Operation<
  "tool/cv",
  CvCrestDetectionToolOperationState
>;
