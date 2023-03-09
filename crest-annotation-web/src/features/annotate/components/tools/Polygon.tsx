import React from "react";
import Konva from "konva";
import { alpha } from "@mui/material";
import { Line, Circle, Group } from "react-konva";
import { Polygon as PolygonShape } from "../../tools/polygon";
import { Position, ShapeProps, ShapeTool } from "./Shape";
import { Shape, Tool } from "../../slice";

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

const onCreate = ({ x, y }: Position) => ({
  points: [x, y],
  preview: [x, y],
  finished: false,
  tool: Tool.Polygon,
});

const onDown = (shape: Shape, { x, y }: Position) => {
  let polygon = shape as PolygonShape;
  let count = polygon.points.length;

  let first = { x: polygon.points[0], y: polygon.points[1] };
  let last = {
    x: polygon.points[count - 2],
    y: polygon.points[count - 1],
  };

  // finish drawing polygon
  // - if area around starting point is clicked
  // - if area around current point is clicked (double click)
  if (
    (Math.abs(x - last.x) <= 5 && Math.abs(y - last.y) <= 5) ||
    (Math.abs(x - first.x) <= 5 && Math.abs(y - first.y) <= 5)
  ) {
    // add last point, which is the same as the first point
    return {
      ...shape,
      points: [...polygon.points, polygon.points[0], polygon.points[1]],
      preview: [],
      finished: true,
    };
    // otherwise add new point
  } else {
    return {
      ...shape,
      points: [...polygon.points, x, y],
    };
  }
};

const onMove = (shape: Shape, { x, y }: Position) => ({
  ...shape,
  preview: [x, y],
});

const onKeyDown = (
  shape: Shape,
  event: React.KeyboardEvent<HTMLDivElement>
) => {
  const polygon = shape as PolygonShape;

  if (event.code === "KeyK" && event.ctrlKey) {
    return {
      ...shape,
      points: [...polygon.points, polygon.points[0], polygon.points[1]],
      finished: true,
      preview: [],
    };
  }

  return undefined;
};

const PolygonTool = {
  component: Polygon,
  onCreate,
  onDown,
  onMove,
  onKeyDown,
} as ShapeTool;

export default PolygonTool;
