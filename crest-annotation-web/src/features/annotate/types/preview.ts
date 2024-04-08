import { ReactElement } from "react";
import { Transformation } from "../../../types/geometry";

/// Properties provided to a shape component
export type PreviewProps<T> = {
  state?: T;
  transformation: Transformation;
};

/// Renders a shape component
export type PreviewFC<T = unknown> = (props: PreviewProps<T>) => ReactElement;
