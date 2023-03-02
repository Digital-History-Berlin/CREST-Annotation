import { ShapeConfig } from "konva/lib/Shape";
import { Annotation } from "../../slice";

export default interface ShapeProps {
  annotation: Annotation;
  shapeConfig: ShapeConfig;
  color: string;
  editing: boolean;
  onRequestCursor?: (cursor: string | undefined) => void;
  onUpdate?: (annotation: Annotation) => void;
}
