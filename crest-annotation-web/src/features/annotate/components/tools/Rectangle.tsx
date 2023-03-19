import React from "react";
import { alpha } from "@mui/material";
import Konva from "konva";
import { Circle, Group, Rect as KonvaRectangle } from "react-konva";
import { Position, ShapeProps, ShapeTool } from "./Shape";
import { Shape, Tool } from "../../slice";
import { Rectangle as RectangleShape } from "../../tools/rectangle";

enum Edges {
  Left = 0,
  Top = 0,
  Center = 0.5,
  Right = 1,
  Bottom = 1,
}

type EditPoint = [Edges, Edges];

const Rectangle = ({
  identifier,
  shape,
  color,
  shapeConfig,
  editing,
  getTransformedPointerPosition,
  onUpdate,
}: ShapeProps) => {
  const rectangle = shape as RectangleShape;

  const editingPoints = [
    [Edges.Center, Edges.Center],
    [Edges.Left, Edges.Bottom],
    [Edges.Left, Edges.Center],
    [Edges.Left, Edges.Top],
    [Edges.Center, Edges.Top],
    [Edges.Right, Edges.Top],
    [Edges.Right, Edges.Center],
    [Edges.Right, Edges.Bottom],
    [Edges.Center, Edges.Bottom],
  ] as EditPoint[];

  // convert coordinate to position
  const xCoord = (edge: Edges) => rectangle.x + rectangle.width * edge;
  // convert coordinate to position
  const yCoord = (edge: Edges) => rectangle.y + rectangle.height * edge;

  const onDragEditPoint = (
    e: Konva.KonvaEventObject<DragEvent>,
    editPoint: EditPoint
  ) => {
    const pos = getTransformedPointerPosition(e);
    if (pos === undefined) return;

    // move on center point
    if (editPoint[0] === Edges.Center && editPoint[1] === Edges.Center) {
      onUpdate?.({
        ...shape,
        x: pos.x - rectangle.width / 2,
        y: pos.y - rectangle.height / 2,
      });
      return;
    }

    const patch = { ...rectangle };

    // change width
    switch (editPoint[0]) {
      case Edges.Left:
        patch.x = pos.x;
        patch.width = rectangle.x + rectangle.width - pos.x;
        break;
      case Edges.Center:
        e.target.x(rectangle.x + rectangle.width / 2);
        break;
      case Edges.Right:
        patch.width = pos.x - rectangle.x;
        break;
    }

    // change height
    switch (editPoint[1]) {
      case Edges.Top:
        patch.y = pos.y;
        patch.height = rectangle.y + rectangle.height - pos.y;
        break;
      case Edges.Center:
        e.target.y(rectangle.y + rectangle.height / 2);
        break;
      case Edges.Right:
        patch.height = pos.y - rectangle.y;
        break;
    }

    // validate width
    if (patch.width < 0) {
      patch.x = patch.x + patch.width;
      patch.width = -patch.width;
    }

    // validate height
    if (patch.height < 0) {
      patch.y = patch.y + patch.height;
      patch.height = -patch.height;
    }

    onUpdate?.(patch as Shape);
  };

  return (
    <Group key={identifier}>
      <KonvaRectangle
        {...shapeConfig}
        x={rectangle.x}
        y={rectangle.y}
        width={rectangle.width}
        height={rectangle.height}
      />
      {editing &&
        editingPoints.map((editPoint) => (
          <Circle
            x={xCoord(editPoint[0])}
            y={yCoord(editPoint[1])}
            radius={5}
            fill={alpha(color, 0.8)}
            draggable
            onDragMove={(e) => onDragEditPoint(e, editPoint)}
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
