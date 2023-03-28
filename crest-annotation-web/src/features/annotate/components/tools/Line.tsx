import React from "react";
import { Line as KonvaLine } from "react-konva";
import { ShapeEventHandler, ShapeProps, ShapeTool } from "./Types";
import { Tool } from "../../slice/tools";
import { Line as LineShape } from "../../tools/line";
import { GestureOverload } from "../types/Events";

const Line = ({ identifier, shape, shapeConfig, onClick }: ShapeProps) => {
  const line = shape as LineShape;

  return (
    <KonvaLine
      {...shapeConfig}
      key={identifier}
      points={line.points}
      closed={line.finished}
      tension={0.5}
      lineCap="round"
      globalCompositeOperation="source-over"
      onClick={onClick}
    />
  );
};

const onGestureDragStart: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary || shape) return;

  return {
    points: [x, y],
    tool: Tool.Pen,
    finished: false,
  };
};

const onGestureDragMove: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary || !shape || shape.finished) return;

  const line = shape as LineShape;

  return {
    ...shape,
    points: [...line.points, x, y],
  };
};

const onGestureDragEnd: ShapeEventHandler = (shape) => {
  if (!shape || shape.finished) return;

  return {
    ...shape,
    finished: true,
  };
};

const LineTool: ShapeTool = {
  component: Line,
  onGestureDragStart,
  onGestureDragMove,
  onGestureDragEnd,
};

export default LineTool;
