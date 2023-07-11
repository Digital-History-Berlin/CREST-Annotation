import React from "react";
import { alpha } from "@mui/material";
import CircleTool from "./Circle";
import LineTool from "./Line";
import MaskTool from "./Mask";
import PolygonTool from "./Polygon";
import RectangleTool from "./Rectangle";
import { ShapeProps } from "./Types";
import { Transformation } from "../../../../types/Transformation";
import { Tool } from "../../slice/tools";

export const shapeMap = {
  [Tool.Pen]: LineTool,
  [Tool.Circle]: CircleTool,
  [Tool.Rectangle]: RectangleTool,
  [Tool.Polygon]: PolygonTool,
  [Tool.Edit]: undefined,
  [Tool.Segment]: MaskTool,
};

export type IProps = ShapeProps & {
  transformation: Transformation;
};

/**
 * Renders a shape of arbitrary type
 *
 * Simplifies the use of different shapes.
 * Contains shared logic between different shapes,
 * like stroke width depending on selection.
 */
const Shape = ({
  shape,
  color,
  selected,
  editable,
  transparent,
  transformation,
  ...props
}: IProps) => {
  const annotationTool = shape?.tool;
  if (annotationTool === undefined) return null;

  const Component = shapeMap[annotationTool]?.component;
  if (!Component) return null;

  // properties passed to shape
  const shapeConfig = {
    stroke: alpha(color, transparent ? 0.2 : selected ? 0.8 : 0.6),
    strokeWidth: (selected ? 3 : 2) / transformation.scale,
    fill: alpha(color, transparent ? 0.1 : selected ? 0.4 : 0.2),
    listening: editable,
  };

  // properties passed to editing points
  const editingPointConfig = {
    radius: 5 / transformation.scale,
  };

  return (
    <Component
      {...props}
      shape={shape}
      color={color}
      editable={editable}
      shapeConfig={shapeConfig}
      editingPointConfig={editingPointConfig}
    />
  );
};

export default Shape;
