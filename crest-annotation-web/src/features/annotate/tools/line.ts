export interface Line {
  /// Flattened array of 2D-coordinates in the form [x1, y1, x2, y2, ...]
  points: number[];
  closed: boolean;
}
