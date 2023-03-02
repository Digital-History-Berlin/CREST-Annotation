import React from "react";
import { Rect as KonvaRectangle } from "react-konva";
import { Rectangle as RectangleShape } from "../../tools/rectangle";
import ShapeProps from "./ShapeProps";

const Rectangle = ({ annotation, shapeConfig }: ShapeProps) => {
  const rectangle = annotation.shape as RectangleShape;

  return (
    <KonvaRectangle
      {...shapeConfig}
      key={annotation.id}
      x={rectangle.x}
      y={rectangle.y}
      width={rectangle.width}
      height={rectangle.height}
    />
  );
};

export default Rectangle;
