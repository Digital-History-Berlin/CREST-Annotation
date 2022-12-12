import { BaseShape } from "./shape";

export interface Line extends BaseShape {
  /// Flattened array of 2D-coordinates in the form [x1, y1, x2, y2, ...]
  points: number[];
}
