import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material";
import Konva from "konva";
import { Group, Circle as KonvaCircle } from "react-konva";
import Anchor from "./Anchor";
import { ShapeEventHandler, ShapeProps, ShapeTool } from "./Types";
import { Shape } from "../../slice/annotations";
import { Tool } from "../../slice/tools";
import { Circle as CircleShape } from "../../tools/circle";
import { GestureOverload } from "../types/Events";

const Circle = ({
  identifier,
  shape,
  color,
  shapeConfig,
  editingPointConfig,
  editable,
  onUpdate,
  onClick,
}: ShapeProps) => {
  // use internal state for editing to avoid re-renders
  const [preview, setPreview] = useState(shape as CircleShape);
  useEffect(() => setPreview(shape as CircleShape), [shape]);

  const dragMoveBorder = (e: Konva.KonvaEventObject<DragEvent>) =>
    setPreview({
      ...preview,
      radius: Math.sqrt(
        Math.pow(e.target.x() - preview.x, 2) +
          Math.pow(e.target.y() - preview.y, 2)
      ),
    });

  const dragEndBorder = (e: Konva.KonvaEventObject<DragEvent>) => {
    // reset the draggable
    e.target.x(preview.x + preview.radius);
    e.target.y(preview.y);

    onUpdate?.(preview as Shape);
  };

  const dragMoveCenter = (e: Konva.KonvaEventObject<DragEvent>) =>
    setPreview({ ...preview, x: e.target.x(), y: e.target.y() });

  const dragEndCenter = () => onUpdate?.(preview as Shape);

  return (
    <Group key={identifier}>
      <KonvaCircle
        {...shapeConfig}
        x={preview.x}
        y={preview.y}
        radius={preview.radius}
        stroke={alpha(color, 0.8)}
        onClick={onClick}
      />
      {editable && (
        <>
          <Anchor
            {...editingPointConfig}
            x={preview.x + preview.radius}
            y={preview.y}
            fill={color}
            onDragMove={dragMoveBorder}
            onDragEnd={dragEndBorder}
          />
          <Anchor
            {...editingPointConfig}
            x={preview.x}
            y={preview.y}
            fill={color}
            onDragMove={dragMoveCenter}
            onDragEnd={dragEndCenter}
          />
        </>
      )}
    </Group>
  );
};

const onGestureDragStart: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary || shape) return;

  // create new shape
  return {
    x: x,
    y: y,
    radius: 0,
    tool: Tool.Circle,
  };
};

const onGestureDragMove: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary || !shape || shape.finished) return;

  const circle = shape as CircleShape;

  // update existing shape
  return {
    ...shape,
    radius: Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)),
  };
};

const onGestureDragEnd: ShapeEventHandler = (shape) => {
  if (!shape || shape.finished) return;

  return {
    ...shape,
    finished: true,
  };
};

const CircleTool: ShapeTool = {
  component: Circle,
  onGestureDragStart,
  onGestureDragMove,
  onGestureDragEnd,
};

export default CircleTool;
