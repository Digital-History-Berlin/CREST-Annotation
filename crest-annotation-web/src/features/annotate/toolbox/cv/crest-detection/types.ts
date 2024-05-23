import { RootState } from "../../../../../app/store";
import { Operation, operationStateOfType } from "../../../types/operation";
import { Tool } from "../../../types/toolbox";
import { cvToolState } from "../create-cv-tool";
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

  index: number;
  boundingBox: SamBoundingBox;
  mask?: SamMask;
}

export type CvCrestDetectionToolOperation = Operation<
  "tool/cv/crest-detection",
  CvCrestDetectionToolOperationState
>;

// narrow down selectors to the specific tool
export const toolState = (state: RootState, ready = true) =>
  cvToolState<CvCrestDetectionToolState>(
    state.toolbox.tools[Tool.Cv],
    "crest-detection",
    ready
  );
export const operationState = (state: RootState) =>
  operationStateOfType<CvCrestDetectionToolOperation>(
    state.operation.current,
    "tool/cv/crest-detection"
  );
