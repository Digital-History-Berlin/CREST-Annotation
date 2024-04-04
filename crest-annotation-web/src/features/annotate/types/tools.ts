import { ReactElement } from "react";
import { Transformation } from "../../../types/geometry";

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
export type PreviewProps<T> = {
  state?: T;
  transformation: Transformation;
};

/// Renders a shape component
export type PreviewFC<T> = (props: PreviewProps<T>) => ReactElement;
