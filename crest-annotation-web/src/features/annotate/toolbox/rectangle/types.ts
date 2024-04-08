import { RectangleShape } from "../../components/shapes/Rectangle";
import { Operation } from "../../types/operation";
import { Tool } from "../../types/toolbox";

export interface RectangleToolState {
  readonly tool: Tool.Rectangle;
  shape: RectangleShape;
  labeling?: boolean;
}

export type RectangleToolOperation = Operation<
  "tool/rectangle",
  RectangleToolState
>;
