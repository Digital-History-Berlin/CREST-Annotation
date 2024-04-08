import { LineShape } from "../../components/shapes/Line";
import { Operation } from "../../types/operation";
import { Tool } from "../../types/toolbox";

export interface PenToolState {
  readonly tool: Tool.Pen;
  shape: LineShape;
  labeling?: boolean;
}

export type PenToolOperation = Operation<"tool/pen", PenToolState>;
