import { CircleShape } from "../../components/shapes/Circle";
import { Operation } from "../../types/operation";
import { Tool } from "../../types/toolbox";

export interface CircleToolOperationState {
  readonly tool: Tool.Circle;
  shape: CircleShape;
  labeling?: boolean;
}

export type CircleToolOperation = Operation<
  "tool/circle",
  CircleToolOperationState
>;
