import React, { useCallback, useEffect, useState } from "react";
import Konva from "konva";
import { Group, Circle as KonvaCircle } from "react-konva";
import Anchor from "./Anchor";
import { ShapeFC, ShapeType } from "../../types/shapes";

export interface CircleShape {
  type: ShapeType.Circle;
  x: number;
  y: number;
  radius: number;
}

export const Circle: ShapeFC<CircleShape> = ({
  identifier,
  shape,
  shapeConfig,
  editingPointConfig,
  editable,
  onUpdate,
  onClick,
}) => {
  // use internal state for editing to avoid re-renders
  const [preview, setPreview] = useState(shape);
  useEffect(() => setPreview(shape), [shape]);

  const dragMoveBorder = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) =>
      setPreview((current) => ({
        ...current,
        radius: Math.sqrt(
          Math.pow(e.target.x() - current.x, 2) +
            Math.pow(e.target.y() - current.y, 2)
        ),
      })),
    [setPreview]
  );

  const dragEndBorder = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      // reset the draggable
      e.target.x(preview.x + preview.radius);
      e.target.y(preview.y);

      onUpdate?.(preview);
    },
    [onUpdate, preview]
  );

  const dragMoveCenter = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) =>
      setPreview((current) => ({
        ...current,
        x: e.target.x(),
        y: e.target.y(),
      })),
    [setPreview]
  );

  const dragEndCenter = useCallback(
    () => onUpdate?.(preview),
    [onUpdate, preview]
  );

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
            onDragMove={dragMoveBorder}
            onDragEnd={dragEndBorder}
          />
          <Anchor
            {...editingPointConfig}
            x={preview.x}
            y={preview.y}
            onDragMove={dragMoveCenter}
            onDragEnd={dragEndCenter}
          />
        </>
      )}
    </Group>
  );
};
