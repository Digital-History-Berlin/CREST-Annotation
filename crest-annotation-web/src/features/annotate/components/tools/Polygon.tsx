import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material";
import Konva from "konva";
import { Group, Line } from "react-konva";
import Anchor from "./Anchor";
import { ShapeEventHandler, ShapeProps, ShapeTool } from "./Types";
import { Shape } from "../../slice/annotations";
import { Tool } from "../../slice/tools";
import { Polygon as PolygonShape } from "../../tools/polygon";
import { GestureOverload } from "../types/Events";

const Polygon = ({
  identifier,
  shape,
  color,
  editable,
  shapeConfig,
  editingPointConfig,
  onUpdate,
  onClick,
}: ShapeProps) => {
  // use internal state for editing to avoid re-renders
  const [preview, setPreview] = useState(shape as PolygonShape);
  useEffect(() => setPreview(shape as PolygonShape), [shape]);

  const dragMove = (e: Konva.KonvaEventObject<DragEvent>, index: number) => {
    const points = [...preview.points];
    points[index] = e.target.x();
    points[index + 1] = e.target.y();

    setPreview({
      ...preview,
      points,
    });
  };

  const dragEnd = () => onUpdate?.(preview as Shape);

  return (
    <Group key={identifier}>
      <Line
        {...shapeConfig}
        points={preview.points.concat(preview.preview)}
        closed={preview.finished}
        stroke={alpha(color, 0.8)}
        tension={0}
        lineCap="round"
        onClick={onClick}
      />
      {editable &&
        preview.points.map(
          (point, index) =>
            index % 2 === 0 && (
              <Anchor
                key={index}
                {...editingPointConfig}
                x={preview.points[index]}
                y={preview.points[index + 1]}
                fill={color}
                onDragMove={(e) => dragMove(e, index)}
                onDragEnd={dragEnd}
              />
            )
        )}
    </Group>
  );
};

const onPrimaryClick: ShapeEventHandler = (
  shape,
  { transformation, transformed: { x, y } }
) => {
  // start new shape
  if (!shape)
    return {
      points: [x, y],
      preview: [x, y],
      finished: false,
      tool: Tool.Polygon,
    };

  if (shape.finished) return;

  const polygon = shape as PolygonShape;

  // finish on click near start
  const dx = polygon.points[0] - x;
  const dy = polygon.points[1] - y;
  const threshold = 5 / transformation.scale;
  if (dx * dx + dy * dy < threshold * threshold)
    return {
      ...shape,
      finished: true,
      preview: [],
    };

  // append new point
  return {
    ...shape,
    points: [...polygon.points, x, y],
  };
};

const onSecondaryClick: ShapeEventHandler = (shape) => {
  if (!shape || shape.finished) return;

  return {
    ...shape,
    finished: true,
    preview: [],
  };
};

const onGestureClick: ShapeEventHandler = (shape, event) => {
  switch (event.overload) {
    case GestureOverload.Primary:
      return onPrimaryClick(shape, event);
    case GestureOverload.Secondary:
      return onSecondaryClick(shape, event);
  }
};

const onGestureMove: ShapeEventHandler = (shape, { transformed: { x, y } }) => {
  if (!shape || shape.finished) return;

  return {
    ...shape,
    preview: [x, y],
  };
};

const PolygonTool: ShapeTool = {
  component: Polygon,
  onGestureClick,
  onGestureDragMove: onGestureMove,
  onGestureMove,
};

export default PolygonTool;
