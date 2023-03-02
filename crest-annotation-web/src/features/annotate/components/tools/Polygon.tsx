import React from "react";
import Konva from "konva";
import { alpha } from "@mui/material";
import { Line, Circle, Group } from "react-konva";
import { Polygon as PolygonShape } from "../../tools/polygon";
import ShapeProps from "./ShapeProps";

const Polygon = ({
  annotation,
  color,
  editing,
  shapeConfig,
  onRequestCursor,
  onUpdate,
}: ShapeProps) => {
  const polygon = annotation.shape as PolygonShape;

  const onDragPolygonPoint = (
    e: Konva.KonvaEventObject<DragEvent>,
    index: number,
    polygon: PolygonShape
  ) => {
    const shape = annotation.shape;
    if (shape === undefined) return;

    const newPoints = [...polygon.points];
    newPoints[index] = e.target.x();
    newPoints[index + 1] = e.target.y();

    onUpdate?.({
      ...annotation,
      shape: {
        ...shape,
        points: newPoints,
      },
    });
  };

  return (
    <Group key={annotation.id}>
      <Line
        {...shapeConfig}
        points={polygon.points.concat(polygon.preview)}
        closed={polygon.finished}
        stroke={alpha(color, 0.8)}
        tension={0}
        lineCap="round"
      />
      {!polygon.finished && (
        <Circle
          x={polygon.points[0]}
          y={polygon.points[1]}
          radius={5}
          opacity={0}
          onMouseEnter={() => onRequestCursor?.("crosshair")}
          onMouseLeave={() => onRequestCursor?.(undefined)}
        />
      )}
      {editing &&
        polygon.points.map(
          (point, index) =>
            index % 2 === 0 && (
              <Circle
                key={index}
                x={polygon.points[index]}
                y={polygon.points[index + 1]}
                radius={5}
                fill={alpha(color, 0.8)}
                draggable
                onDragMove={(e) => {
                  onDragPolygonPoint(e, index, polygon);
                }}
              />
            )
        )}
    </Group>
  );
};

export default Polygon;
