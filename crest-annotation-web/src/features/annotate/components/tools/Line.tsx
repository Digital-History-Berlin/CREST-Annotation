import React from "react";
import { Line as KonvaLine } from "react-konva";
import {
  ShapeEventHandler,
  ShapeGestureError,
  ShapeProps,
  ShapeTool,
  assertTool,
} from "./Types";
import { GestureOverload } from "../../../../types/Events";
import { Shape } from "../../slice/annotations";
import { Tool } from "../../slice/tools";
import { Line as LineShape } from "../../tools/line";

const validate = (shape: Shape | undefined) =>
  assertTool<LineShape>(shape, Tool.Circle);

const Line = ({ identifier, shape, shapeConfig, onClick }: ShapeProps) => {
  const line = shape as LineShape;

  return (
    <KonvaLine
      {...shapeConfig}
      key={identifier}
      points={line.points}
      closed={line.closed}
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
  if (overload !== GestureOverload.Primary) return ["ignore"];
  if (shape) throw new ShapeGestureError("Shape exists");

  return [
    "proceed",
    {
      points: [x, y],
      closed: false,
      tool: Tool.Pen,
    },
  ];
};

const onGestureDragMove: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary) return ["ignore"];
  const line = validate(shape);

  return [
    "proceed",
    {
      ...line,
      points: [...line.points, x, y],
    },
  ];
};

const onGestureDragEnd: ShapeEventHandler = (shape) => {
  const line = validate(shape);

  return [
    "resolve",
    {
      ...line,
      close: true,
    },
  ];
};

const LineTool: ShapeTool = {
  component: Line,
  onGestureDragStart,
  onGestureDragMove,
  onGestureDragEnd,
};

export default LineTool;
