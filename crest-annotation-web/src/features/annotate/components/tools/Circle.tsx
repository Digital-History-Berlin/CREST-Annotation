import React from "react";
import { Circle as KonvaCircle } from "react-konva";
import { Circle as CircleShape } from "../../tools/circle";
import ShapeProps from "./ShapeProps";

const Circle = ({ annotation, shapeConfig }: ShapeProps) => {
  const circle = annotation.shape as CircleShape;

  return (
    <KonvaCircle
      {...shapeConfig}
      key={annotation.id}
      x={circle.x}
      y={circle.y}
      radius={circle.radius}
    />
  );
};

export const createCircle = () => {};

export default Circle;
