import React from "react";
import { Rect as KonvaRectangle } from "react-konva";
import { Shape, Tool } from "../../slice";
import { Rectangle as RectangleShape } from "../../tools/rectangle";
import { Position, ShapeProps, ShapeTool } from "./Shape";

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

const onCreate = ({ x, y }: Position) => ({
  x: x,
  y: y,
  width: 0,
  height: 0,
  tool: Tool.Rectangle,
});

const onMove = (shape: Shape, { x, y }: Position) => {
  const rectangle = shape as RectangleShape;
  return {
    ...shape,
    width: x - rectangle.x,
    height: y - rectangle.y,
  };
};

const onUp = (shape: Shape, { x, y }: Position) => ({
  ...shape,
  finished: true,
});

const RectangleTool = {
  component: Rectangle,
  onCreate,
  onMove,
  onUp,
} as ShapeTool;

export default RectangleTool;
