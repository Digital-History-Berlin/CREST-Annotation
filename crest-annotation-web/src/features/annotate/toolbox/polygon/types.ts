import { PolygonShape } from "../../components/shapes/Polygon";
import { Operation } from "../../types/operation";
import { Tool } from "../../types/toolbox";

export interface PolygonToolState {
  readonly tool: Tool.Polygon;
  shape: PolygonShape;
  preview?: [number, number];
  labeling?: boolean;
}

export type PolygonToolOperation = Operation<"tool/polygon", PolygonToolState>;
