import { Label } from "../../../../../api/openApi";
import { RootState } from "../../../../../app/store";
import { Operation, operationStateOfType } from "../../../types/operation";
import { Tool } from "../../../types/toolbox";
import { cvToolState } from "../create-cv-tool";
import { useCvToolConfig, useCvToolData } from "../hooks";
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
  showPixelMask: boolean;
  skipDuplicates: boolean;
  overlapThreshold: number;
  skipCovered: boolean;
  coverageThreshold: number;
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
  label: Label;
  boundingBox: SamBoundingBox;
  mask?: SamMask;
  edit?: boolean;
}

export type CvCrestDetectionToolOperation = Operation<
  "tool/cv/crest-detection",
  CvCrestDetectionToolOperationState
>;

export const defaultConfig: CvCrestDetectionToolConfig = {
  autostart: true,
  showPixelMask: false,
  skipDuplicates: true,
  overlapThreshold: 0.1,
  skipCovered: true,
  coverageThreshold: 0.1,
};

export const defaultData: CvCrestDetectionToolData = {
  boundingBoxes: [],
};

// narrow down hooks to the specific tool
export const useCvCrestDetectionToolConfig = () =>
  useCvToolConfig<CvCrestDetectionToolConfig>("crest-detection");
export const useCvCrestDetectionToolData = () =>
  useCvToolData<CvCrestDetectionToolData>("crest-detection");

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
