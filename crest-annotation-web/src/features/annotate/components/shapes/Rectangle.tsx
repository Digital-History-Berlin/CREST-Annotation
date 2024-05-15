import React, { useCallback, useEffect, useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Group, Rect as KonvaRectangle, Text } from "react-konva";
import Anchor from "./Anchor";
import { ShapeFC } from "../../types/components";
import { ShapeType } from "../../types/shapes";

export interface RectangleShape {
  type: ShapeType.Rectangle;
  x: number;
  y: number;
  width: number;
  height: number;
  // rectangle can have additional caption
  caption?: string;
}

enum Edges {
  Left = 0,
  Top = 0,
  Center = 0.5,
  Right = 1,
  Bottom = 1,
}

type EditPoint = [Edges, Edges];

export const Rectangle: ShapeFC<RectangleShape> = ({
  identifier,
  shape,
  shapeConfig,
  editingPointConfig,
  editable,
  fontSize,
  onUpdate,
  onClick,
}) => {
  // use internal state for editing to avoid re-renders
  const [preview, setPreview] = useState(shape);
  useEffect(() => setPreview(shape), [shape]);

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

  const dragMovePoint = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, editPoint: EditPoint) =>
      setPreview((current) => {
        const pos = { x: e.target.x(), y: e.target.y() };
        const patch = { ...current };

        // change width
        switch (editPoint[0]) {
          case Edges.Left:
            patch.x = pos.x;
            patch.width = current.x + current.width - pos.x;
            break;
          case Edges.Center:
            // lock movement along x axis
            e.target.x(current.x + current.width / 2);
            break;
          case Edges.Right:
            patch.width = pos.x - current.x;
            break;
        }

        // change height
        switch (editPoint[1]) {
          case Edges.Top:
            patch.y = pos.y;
            patch.height = current.y + current.height - pos.y;
            break;
          case Edges.Center:
            // lock movement along y axis
            e.target.y(current.y + current.height / 2);
            break;
          case Edges.Right:
            patch.height = pos.y - current.y;
            break;
        }

        return patch;
      }),
    [setPreview]
  );

  const dragMoveCenter = useCallback(
    (e: KonvaEventObject<DragEvent>) =>
      setPreview((current) => ({
        ...current,
        x: e.target.x() - current.width / 2,
        y: e.target.y() - current.height / 2,
      })),
    [setPreview]
  );

  const dragEnd = useCallback(
    () =>
      onUpdate?.({
        ...preview,
        // normalize rectangle
        x: Math.min(preview.x, preview.x + preview.width),
        y: Math.min(preview.y, preview.y + preview.height),
        width: Math.abs(preview.width),
        height: Math.abs(preview.height),
      }),
    [onUpdate, preview]
  );

  return (
    <Group key={identifier}>
      <KonvaRectangle
        {...shapeConfig}
        x={preview.x}
        y={preview.y}
        width={preview.width}
        height={preview.height}
        onClick={onClick}
      />
      {fontSize && (
        <Text
          text={shape.caption}
          x={preview.x + fontSize / 4}
          y={preview.y + fontSize / 4}
          fontSize={fontSize}
        />
      )}
      {editable && (
        <>
          <Anchor
            {...editingPointConfig}
            x={preview.x + preview.width / 2}
            y={preview.y + preview.height / 2}
            onDragMove={dragMoveCenter}
            onDragEnd={dragEnd}
          />
          {editingPoints.map((editPoint, index) => (
            <Anchor
              key={index}
              {...editingPointConfig}
              x={xCoord(editPoint[0])}
              y={yCoord(editPoint[1])}
              onDragMove={(e) => dragMovePoint(e, editPoint)}
              onDragEnd={dragEnd}
            />
          ))}
        </>
      )}
    </Group>
  );
};
