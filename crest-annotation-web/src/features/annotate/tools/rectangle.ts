import { BaseShape } from "./shape";

export interface Rectangle extends BaseShape {
  x: number;
  y: number;
  width: number;
  height: number;
}
