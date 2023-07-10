import React, { useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { CircleConfig } from "konva/lib/shapes/Circle";
import { Circle } from "react-konva";

type IProps = {
  onDragStart?: (event: KonvaEventObject<DragEvent>) => void;
  onDragMove?: (event: KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (event: KonvaEventObject<DragEvent>) => void;
} & Omit<CircleConfig, "onDragStart" | "onDragMove" | "onDragEnd">;

const Anchor = ({
  x,
  y,
  onDragStart,
  onDragMove,
  onDragEnd,
  ...props
}: IProps) => {
  // do not update the anchor's position while dragging
  const [start, setStart] = useState<{ x?: number; y?: number }>();

  const handleDragStart = (event: KonvaEventObject<DragEvent>) => {
    setStart({ x, y });
    onDragStart?.(event);
  };

  const handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    onDragEnd?.(event);
    setStart(undefined);
  };

  const handleDragMove = (event: KonvaEventObject<DragEvent>) =>
    onDragMove?.(event);

  return (
    <Circle
      {...props}
      x={start?.x ?? x}
      y={start?.y ?? y}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      draggable
    />
  );
};

export default Anchor;
