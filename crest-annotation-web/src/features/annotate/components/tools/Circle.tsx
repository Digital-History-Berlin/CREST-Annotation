import React, { useEffect, useState } from "react";
import Konva from "konva";
import { Group, Circle as KonvaCircle } from "react-konva";
import Anchor from "./Anchor";
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
import { Circle as CircleShape } from "../../tools/circle";

const validate = (shape: Shape | undefined) =>
  assertTool<CircleShape>(shape, Tool.Circle);

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
  if (overload !== GestureOverload.Primary) return ["ignore"];
  if (shape) throw new ShapeGestureError("Shape exists");

  // create new shape
  return [
    "proceed",
    {
      x: x,
      y: y,
      radius: 0,
      tool: Tool.Circle,
    },
  ];
};

const onGestureDragMove: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary) return ["ignore"];
  const circle = validate(shape);

  return [
    "proceed",
    {
      ...circle,
      radius: Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)),
    },
  ];
};

const onGestureDragEnd: ShapeEventHandler = (shape) => {
  return ["resolve", validate(shape)];
};

const CircleTool: ShapeTool = {
  component: Circle,
  onGestureDragStart,
  onGestureDragMove,
  onGestureDragEnd,
};

export default CircleTool;
