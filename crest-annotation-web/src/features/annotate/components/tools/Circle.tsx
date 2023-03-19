import React from "react";
import { alpha } from "@mui/material";
import Konva from "konva";
import { Group, Circle as KonvaCircle } from "react-konva";
import Anchor from "./Anchor";
import { Position, ShapeProps, ShapeTool } from "./Shape";
import { Shape, Tool } from "../../slice";
import { Circle as CircleShape } from "../../tools/circle";

const Circle = ({
  identifier,
  shape,
  color,
  shapeConfig,
  editingPointConfig,
  editing,
  onUpdate,
  getTransformedPointerPosition,
}: ShapeProps) => {
  const circle = shape as CircleShape;

  const onDragBorder = (e: Konva.KonvaEventObject<DragEvent>) => {
    const pos = getTransformedPointerPosition(e);
    if (pos === undefined) return;

    // stop konva from changing the position of the ring object
    // and keep it in the center of the original circle
    e.target?.setAttrs({
      x: circle.x + circle.radius,
      y: circle.y,
    });

    const radius = Math.sqrt(
      Math.pow(pos.x - circle.x, 2) + Math.pow(pos.y - circle.y, 2)
    );

    onUpdate?.({
      ...shape,
      radius: radius,
    });
  };

  const onDragCenter = (e: Konva.KonvaEventObject<DragEvent>) => {
    const pos = getTransformedPointerPosition(e);
    if (pos === undefined) return;

    onUpdate?.({
      ...shape,
      x: pos.x,
      y: pos.y,
    });
  };

  return (
    <Group key={identifier}>
      <KonvaCircle
        {...shapeConfig}
        x={circle.x}
        y={circle.y}
        radius={circle.radius}
        stroke={alpha(color, 0.8)}
      />
      {editing && (
        <>
          <Anchor
            {...editingPointConfig}
            x={circle.x + circle.radius}
            y={circle.y}
            fill={color}
            onDragMove={onDragBorder}
          />
          <Anchor
            {...editingPointConfig}
            x={circle.x}
            y={circle.y}
            fill={color}
            onDragMove={onDragCenter}
          />
        </>
      )}
    </Group>
  );
};

const onCreate = ({ x, y }: Position) => ({
  x: x,
  y: y,
  radius: 0,
  tool: Tool.Circle,
});

const onMove = (shape: Shape, { x, y }: Position) => {
  const circle = shape as CircleShape;

  return {
    ...shape,
    radius: Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)),
  };
};

const onUp = (shape: Shape) => ({
  ...shape,
  finished: true,
});

const CircleTool = {
  component: Circle,
  onCreate,
  onMove,
  onUp,
} as ShapeTool;

export default CircleTool;
