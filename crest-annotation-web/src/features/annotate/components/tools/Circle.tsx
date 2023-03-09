import React from "react";
import { Circle as KonvaCircle, Ring } from "react-konva";
import { Circle as CircleShape } from "../../tools/circle";
import ShapeProps from "./ShapeProps";
import Konva from "konva";

const Circle = ({ annotation, shapeConfig, editing, onUpdate }: ShapeProps) => {
  const circle = annotation.shape as CircleShape;

  const onDragCircle = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Edit only with left mouse button
    if (e.evt.buttons !== 1) return;

    const shape = annotation.shape;
    if (shape === undefined) return;

    const stage = e.target?.getStage();
    if (stage === undefined || stage === null) return;

    const pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    const radius = Math.sqrt(
      Math.pow(pos.x - circle.x, 2) + Math.pow(pos.y - circle.y, 2)
    );

    onUpdate?.({
      ...annotation,
      shape: {
        ...shape,
        radius: radius,
      },
    });
  };

  return (
    <>
      <KonvaCircle
        {...shapeConfig}
        key={annotation.id}
        x={circle.x}
        y={circle.y}
        radius={circle.radius}
      />
      {editing && (
        <Ring
          x={circle.x}
          y={circle.y}
          innerRadius={circle.radius * 0.9}
          outerRadius={circle.radius * 1.1}
          listening={true}
          fill={"red"}
          onMouseMove={(e) => {
            onDragCircle(e);
          }}
        />
      )}
    </>
  );
};

export const createCircle = () => {};

export default Circle;
