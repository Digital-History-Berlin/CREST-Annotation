import React, { useCallback, useEffect, useState } from "react";
import Konva from "konva";
import { Group, Line } from "react-konva";
import Anchor from "./Anchor";
import { ShapeFC } from "../../types/components";
import { ShapeType } from "../../types/shapes";

export interface PolygonShape {
  type: ShapeType.Polygon;
  points: number[];
  closed: boolean;
}

export const Polygon: ShapeFC<PolygonShape> = ({
  identifier,
  shape,
  editable,
  shapeConfig,
  editingPointConfig,
  onUpdate,
  onClick,
}) => {
  // use internal state for editing to avoid re-renders
  const [preview, setPreview] = useState(shape);
  useEffect(() => setPreview(shape), [shape]);

  const dragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, index: number) =>
      setPreview((current) => {
        const points = [...current.points];
        points[index] = e.target.x();
        points[index + 1] = e.target.y();

        return {
          ...current,
          points,
        };
      }),
    [setPreview]
  );

  const dragEnd = useCallback(() => onUpdate?.(preview), [onUpdate, preview]);

  return (
    <Group key={identifier}>
      <Line
        {...shapeConfig}
        points={preview.points}
        closed={preview.closed}
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
                onDragMove={(e) => dragMove(e, index)}
                onDragEnd={dragEnd}
              />
            )
        )}
    </Group>
  );
};
