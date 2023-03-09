import { BaseShape } from "./shape";

export interface Polygon extends BaseShape {
  points: number[];
  preview: number[];
}
