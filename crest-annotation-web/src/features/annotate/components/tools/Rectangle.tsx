import React from "react";
import { Circle, Group, Rect as KonvaRectangle } from "react-konva";
import { Shape, Tool } from "../../slice";
import { Rectangle as RectangleShape } from "../../tools/rectangle";
import { Position, ShapeProps, ShapeTool } from "./Shape";
import { alpha } from "@mui/material";
import Konva from "konva";

const Rectangle = ({
  annotation,
  color,
  shapeConfig,
  editing,
  getTransformedPointerPosition,
  onUpdate,
}: ShapeProps) => {
  const rectangle = annotation.shape as RectangleShape;

  const onDragCenter = (e: Konva.KonvaEventObject<DragEvent>) => {
    const shape = annotation.shape;
    if (shape === undefined) return;

    const pos = getTransformedPointerPosition(e);
    if (pos === undefined) return;

    onUpdate?.({
      ...annotation,
      shape: {
        ...shape,
        x: pos.x - rectangle.width / 2,
        y: pos.y - rectangle.height / 2,
      },
    });
  };

  return (
    <Group key={annotation.id}>
      <KonvaRectangle
        {...shapeConfig}
        key={annotation.id}
        x={rectangle.x}
        y={rectangle.y}
        width={rectangle.width}
        height={rectangle.height}
      />
      {editing && (
        <Circle
          x={rectangle.x + rectangle.width / 2}
          y={rectangle.y + rectangle.height / 2}
          radius={5}
          fill={alpha(color, 0.8)}
          draggable
          onDragMove={(e) => {
            onDragCenter(e);
          }}
        />
      )}
    </Group>
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

const onUp = (shape: Shape) => ({
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
