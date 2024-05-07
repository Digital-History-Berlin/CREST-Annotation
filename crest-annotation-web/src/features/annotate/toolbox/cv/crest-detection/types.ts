export interface SamBoundingBox {
  bbox: number[];
  predictedIou: number;
  stabilityScore: number;
}

export interface CrestToolState {
  boundingBoxes: SamBoundingBox[];
}
