import { RootState } from "../../../../../app/store";
import { MaskShape } from "../../../components/shapes/Mask";
import { Operation, operationStateOfType } from "../../../types/operation";
import { Tool } from "../../../types/toolbox";
import { cvToolState } from "../create-cv-tool";
import { CvToolState } from "../types";

export interface CvGenericSingleMaskToolOperationState {
  readonly tool: Tool.Cv;
  shape?: MaskShape;
  labeling?: boolean;
}

export type CvGenericSingleMaskToolOperation = Operation<
  "tool/cv/generic-single-mask",
  CvGenericSingleMaskToolOperationState
>;

// narrow down selectors to the specific tool
export const toolState = (state: RootState, ready = true) =>
  cvToolState<CvToolState>(
    state.toolbox.tools[Tool.Cv],
    "generic-single-mask",
    ready
  );
export const operationState = (state: RootState) =>
  operationStateOfType<CvGenericSingleMaskToolOperation>(
    state.operation.current,
    "tool/cv/generic-single-mask"
  );
