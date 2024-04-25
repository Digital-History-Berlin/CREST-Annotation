import React from "react";
import { Line as KonvaLine } from "react-konva";
import { ShapeFC } from "../../types/components";
import { ShapeType } from "../../types/shapes";

export interface LineShape {
  type: ShapeType.Line;
  /// Flattened array of 2D-coordinates in the form [x1, y1, x2, y2, ...]
  points: number[];
  closed: boolean;
}

export const Line: ShapeFC<LineShape> = ({
  identifier,
  shape,
  shapeConfig,
  onClick,
}) => {
  return (
    <KonvaLine
      {...shapeConfig}
      key={identifier}
      points={shape.points}
      closed={shape.closed}
      tension={0.5}
      lineCap="round"
      globalCompositeOperation="source-over"
      onClick={onClick}
    />
  );
};
