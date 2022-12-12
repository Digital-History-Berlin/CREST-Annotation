import { BaseShape } from "./shape";

export interface Polygon extends BaseShape {
  points: number[];
  finished: boolean;
}
