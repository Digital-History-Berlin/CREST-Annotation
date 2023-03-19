import React from "react";
import { Circle as KonvaCircle, Group, Ring } from "react-konva";
import { Circle as CircleShape } from "../../tools/circle";
import { Shape, Tool } from "../../slice";
import { Position, ShapeProps, ShapeTool } from "./Shape";
import Konva from "konva";
import { alpha } from "@mui/material";

const Circle = ({
  annotation,
  color,
  shapeConfig,
  editing,
  onUpdate,
  getTransformedPointerPosition,
}: ShapeProps) => {
  const circle = annotation.shape as CircleShape;

  const onDragBorder = (e: Konva.KonvaEventObject<DragEvent>) => {
    const shape = annotation.shape;
    if (shape === undefined) return;

    const pos = getTransformedPointerPosition(e);
    if (pos === undefined) return;

    // stop konva from changing the position of the ring object and keep it in the center of the original circle
    e.target?.setAttrs({
      x: circle.x,
      y: circle.y,
    });

    const radius = Math.sqrt(
      Math.pow(pos.x - circle.x, 2) + Math.pow(pos.y - circle.y, 2)
    );

    onUpdate?.({
      ...annotation,
      shape: {
        ...shape,
        radius: radius,
      },
    });
  };

  const onDragCenter = (e: Konva.KonvaEventObject<DragEvent>) => {
    const shape = annotation.shape;
    if (shape === undefined) return;

    const pos = getTransformedPointerPosition(e);
    if (pos === undefined) return;

    onUpdate?.({
      ...annotation,
      shape: {
        ...shape,
        x: pos.x,
        y: pos.y,
      },
    });
  };

  return (
    <Group key={annotation.id}>
      <KonvaCircle
        {...shapeConfig}
        x={circle.x}
        y={circle.y}
        radius={circle.radius}
      />
      {editing && (
        <>
          <Ring
            x={circle.x}
            y={circle.y}
            innerRadius={circle.radius - 3}
            outerRadius={circle.radius + 3}
            offset={{ x: 0, y: 0 }}
            listening={true}
            fill={alpha(color, 0.8)}
            draggable
            onDragMove={(e) => {
              onDragBorder(e);
            }}
          />
          <KonvaCircle
            x={circle.x}
            y={circle.y}
            radius={5}
            fill={alpha(color, 0.8)}
            draggable
            onDragMove={(e) => {
              onDragCenter(e);
            }}
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
