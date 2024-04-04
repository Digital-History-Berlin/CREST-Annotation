import { ReactElement } from "react";
import { Transformation } from "../../../types/geometry";
import { Operation } from "../hooks/use-operation-controller";

export enum Tool {
  Edit = "Edit",
  Pen = "Pen",
  Circle = "Circle",
  Rectangle = "Rectangle",
  Polygon = "Polygon",
  Segment = "Segment",
}

export enum Modifiers {
  Group = "Group",
}

export enum ToolStatus {
  Failed = "Failed",
  Loading = "Loading",
  Ready = "Ready",
}

/// Properties provided to a shape component
export type PreviewProps<T extends Operation> = {
  operation?: T;
  transformation: Transformation;
};

/// Renders a shape component
export type PreviewFC<T extends Operation> = (
  props: PreviewProps<T>
) => ReactElement;
