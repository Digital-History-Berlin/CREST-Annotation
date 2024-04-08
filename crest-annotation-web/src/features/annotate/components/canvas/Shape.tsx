import React from "react";
import { alpha } from "@mui/material";
import { Transformation } from "../../../../types/geometry";
import { shapeRegistry } from "../../toolbox";
import { Shape as DataShape, ShapeProps } from "../../types/shapes";

export type IProps = ShapeProps<DataShape> & {
  transformation: Transformation;
  color: string;
};

/// Renders a shape of arbitrary type
const Shape = ({
  shape,
  selected,
  editable,
  transparent,
  color,
  transformation,
  ...props
}: IProps) => {
  const Component = shapeRegistry[shape.type];
  if (Component === undefined) return null;

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
      editable={editable}
      shapeConfig={shapeConfig}
      editingPointConfig={editingPointConfig}
    />
  );
};

export default Shape;
