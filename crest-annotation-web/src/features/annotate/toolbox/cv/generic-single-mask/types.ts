import { MaskShape } from "../../../components/shapes/Mask";
import { Operation } from "../../../types/operation";
import { Tool } from "../../../types/toolbox";

export interface CvGenericSingleMaskToolOperationState {
  readonly tool: Tool.Cv;
  shape?: MaskShape;
  labeling?: boolean;
}

export type CvGenericSingleMaskToolOperation = Operation<
  "tool/cv",
  CvGenericSingleMaskToolOperationState
>;
