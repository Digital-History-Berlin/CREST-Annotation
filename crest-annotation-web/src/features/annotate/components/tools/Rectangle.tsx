import React from "react";
import { alpha } from "@mui/material";
import Konva from "konva";
import { Circle, Group, Rect as KonvaRectangle } from "react-konva";
import { Position, ShapeProps, ShapeTool } from "./Shape";
import { Shape, Tool } from "../../slice";
import { Rectangle as RectangleShape } from "../../tools/rectangle";

const Rectangle = ({
  annotation,
  color,
  shapeConfig,
  editing,
  getTransformedPointerPosition,
  onUpdate,
}: ShapeProps) => {
  const rectangle = annotation.shape as RectangleShape;

  const editingPoints = [
    {
      x: rectangle.x + rectangle.width / 2,
      y: rectangle.y + rectangle.height / 2,
    },
    { x: rectangle.x, y: rectangle.y },
    { x: rectangle.x + rectangle.width / 2, y: rectangle.y },
    { x: rectangle.x + rectangle.width, y: rectangle.y },
    { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height / 2 },
    { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
    { x: rectangle.x + rectangle.width / 2, y: rectangle.y + rectangle.height },
    { x: rectangle.x, y: rectangle.y + rectangle.height },
    { x: rectangle.x, y: rectangle.y + rectangle.height / 2 },
  ];

  const onDragEditPoint = (
    e: Konva.KonvaEventObject<DragEvent>,
    index: number
  ) => {
    const shape = annotation.shape;
    if (shape === undefined) return;

    const pos = getTransformedPointerPosition(e);
    if (pos === undefined) return;

    let changes = {};

    switch (index) {
      // center
      case 0:
        changes = {
          x: pos.x - rectangle.width / 2,
          y: pos.y - rectangle.height / 2,
        };
        break;
      // top left
      case 1:
        changes = {
          x: pos.x,
          y: pos.y,
          width: rectangle.x + rectangle.width - pos.x,
          height: rectangle.y + rectangle.height - pos.y,
        };
        break;
      // top middle
      case 2:
        // lock edit point in x-axis, only move in y-axis
        e.target.x(rectangle.x + rectangle.width / 2);
        changes = {
          y: pos.y,
          height: rectangle.y + rectangle.height - pos.y,
        };
        break;
      // top right
      case 3:
        changes = {
          y: pos.y,
          height: rectangle.y + rectangle.height - pos.y,
          width: pos.x - rectangle.x,
        };
        break;
      // right middle
      case 4:
        // lock edit point in y-axis, only move in x-axis
        e.target.y(rectangle.y + rectangle.height / 2);
        changes = { width: pos.x - rectangle.x };
        break;
      // bottom right
      case 5:
        changes = {
          width: pos.x - rectangle.x,
          height: pos.y - rectangle.y,
        };
        break;
      // bottom middle
      case 6:
        // lock edit point in x-axis, only move in y-axis
        e.target.x(rectangle.x + rectangle.width / 2);
        changes = { height: pos.y - rectangle.y };
        break;
      // bottom left
      case 7:
        changes = {
          x: pos.x,
          width: rectangle.x + rectangle.width - pos.x,
          height: pos.y - rectangle.y,
        };
        break;
      // left middle
      case 8:
        // lock edit point in y-axis, only move in x-axis
        e.target.y(rectangle.y + rectangle.height / 2);
        changes = {
          x: pos.x,
          width: rectangle.x + rectangle.width - pos.x,
        };
    }

    onUpdate?.({
      ...annotation,
      shape: {
        ...shape,
        ...changes,
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
      {editing &&
        editingPoints.map((editPoint, index) => (
          <Circle
            x={editPoint.x}
            y={editPoint.y}
            radius={5}
            fill={alpha(color, 0.8)}
            draggable
            onDragMove={(e) => {
              onDragEditPoint(e, index);
            }}
          />
        ))}
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
