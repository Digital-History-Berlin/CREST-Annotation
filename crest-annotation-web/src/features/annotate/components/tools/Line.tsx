import React from "react";
import { Line as KonvaLine } from "react-konva";
import { Line as LineShape } from "../../tools/line";
import ShapeProps from "./ShapeProps";

const Line = ({ annotation, shapeConfig }: ShapeProps) => {
  const line = annotation.shape as LineShape;

  return (
    <KonvaLine
      {...shapeConfig}
      key={annotation.id}
      points={line.points}
      closed={line.finished}
      tension={0.5}
      lineCap="round"
      globalCompositeOperation="source-over"
    />
  );
};

export default Line;
