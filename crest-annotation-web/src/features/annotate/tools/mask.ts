import { BaseShape } from "./shape";

export interface Mask extends BaseShape {
  mask: number[][];
  width: number;
  height: number;
  dx: number;
  dy: number;
}
