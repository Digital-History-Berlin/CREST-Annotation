import React from "react";
import { Line as KonvaLine } from "react-konva";
import { Position, ShapeProps, ShapeTool } from "./Shape";
import { Shape, Tool } from "../../slice";
import { Line as LineShape } from "../../tools/line";

const Line = ({ annotation, shapeConfig }: ShapeProps) => {
  const line = annotation.shape as LineShape;

  return (
    <KonvaLine
      {...shapeConfig}
      key={annotation.id}
      points={line.points}
      closed={line.finished}
      tension={0.5}
      lineCap="round"
      globalCompositeOperation="source-over"
    />
  );
};

const onCreate = ({ x, y }: Position) => ({
  points: [x, y],
  tool: Tool.Pen,
  finished: false,
});

const onMove = (shape: Shape, { x, y }: Position) => {
  const line = shape as LineShape;

  return {
    ...shape,
    points: [...line.points, x, y],
  };
};

const onUp = (shape: Shape) => ({
  ...shape,
  finished: true,
});

const LineTool = {
  component: Line,
  onCreate,
  onMove,
  onUp,
} as ShapeTool;

export default LineTool;
