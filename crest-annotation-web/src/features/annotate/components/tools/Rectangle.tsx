import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Group, Rect as KonvaRectangle } from "react-konva";
import Anchor from "./Anchor";
import { ShapeEventHandler, ShapeProps, ShapeTool } from "./Types";
import { Shape } from "../../slice/annotations";
import { Tool } from "../../slice/tools";
import { Rectangle as RectangleShape } from "../../tools/rectangle";
import { GestureOverload } from "../types/Events";

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
  editingPointConfig,
  editable,
  onUpdate,
  onClick,
}: ShapeProps) => {
  // use internal state for editing to avoid re-renders
  const [preview, setPreview] = useState(shape as RectangleShape);
  useEffect(() => setPreview(shape as RectangleShape), [shape]);

  const editingPoints = [
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
  const xCoord = (edge: Edges) => preview.x + preview.width * edge;
  // convert coordinate to position
  const yCoord = (edge: Edges) => preview.y + preview.height * edge;

  const dragMovePoint = (
    e: Konva.KonvaEventObject<DragEvent>,
    editPoint: EditPoint
  ) => {
    const pos = { x: e.target.x(), y: e.target.y() };
    const patch = { ...preview };

    // change width
    switch (editPoint[0]) {
      case Edges.Left:
        patch.x = pos.x;
        patch.width = preview.x + preview.width - pos.x;
        break;
      case Edges.Center:
        // lock movement along x axis
        e.target.x(preview.x + preview.width / 2);
        break;
      case Edges.Right:
        patch.width = pos.x - preview.x;
        break;
    }

    // change height
    switch (editPoint[1]) {
      case Edges.Top:
        patch.y = pos.y;
        patch.height = preview.y + preview.height - pos.y;
        break;
      case Edges.Center:
        // lock movement along y axis
        e.target.y(preview.y + preview.height / 2);
        break;
      case Edges.Right:
        patch.height = pos.y - preview.y;
        break;
    }

    setPreview(patch);
  };

  const dragMoveCenter = (e: KonvaEventObject<DragEvent>) =>
    setPreview({
      ...preview,
      x: e.target.x() - preview.width / 2,
      y: e.target.y() - preview.height / 2,
    });

  const dragEnd = () =>
    onUpdate?.({
      ...preview,
      // normalize rectangle
      x: Math.min(preview.x, preview.x + preview.width),
      y: Math.min(preview.y, preview.y + preview.height),
      width: Math.abs(preview.width),
      height: Math.abs(preview.height),
    } as Shape);

  return (
    <Group key={identifier}>
      <KonvaRectangle
        {...shapeConfig}
        x={preview.x}
        y={preview.y}
        width={preview.width}
        height={preview.height}
        stroke={alpha(color, 0.8)}
        onClick={onClick}
      />
      {editable && (
        <>
          <Anchor
            {...editingPointConfig}
            x={preview.x + preview.width / 2}
            y={preview.y + preview.height / 2}
            fill={color}
            onDragMove={dragMoveCenter}
            onDragEnd={dragEnd}
          />
          {editingPoints.map((editPoint, index) => (
            <Anchor
              key={index}
              {...editingPointConfig}
              x={xCoord(editPoint[0])}
              y={yCoord(editPoint[1])}
              fill={color}
              onDragMove={(e) => dragMovePoint(e, editPoint)}
              onDragEnd={dragEnd}
            />
          ))}
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

  return {
    x: x,
    y: y,
    width: 0,
    height: 0,
    tool: Tool.Rectangle,
  };
};

const onGestureDragMove: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary || !shape || shape.finished) return;

  const rectangle = shape as RectangleShape;

  return {
    ...shape,
    width: x - rectangle.x,
    height: y - rectangle.y,
  };
};

const onGestureDragEnd: ShapeEventHandler = (shape) => {
  if (!shape || shape.finished) return;

  return {
    ...shape,
    finished: true,
  };
};

const RectangleTool: ShapeTool = {
  component: Rectangle,
  onGestureDragStart,
  onGestureDragMove,
  onGestureDragEnd,
};

export default RectangleTool;
