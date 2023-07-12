import React, { useEffect, useRef } from "react";
import { Group, Image } from "react-konva";
import { ShapeProps } from "./Types";
import { Mask as MaskShape } from "../../tools/mask";

export const Mask = ({ identifier, shape, onClick }: ShapeProps) => {
  const mask = shape as MaskShape;

  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!canvasRef.current)
      // create new canvas if neccessary
      canvasRef.current = document.createElement("canvas");
    const context = canvasRef.current.getContext("2d");

    if (!context || !mask.width || !mask.height) return;

    const { width, height } = mask;
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const id = context.createImageData(width, height);
    const d = id.data;

    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; y++) {
        d[x * 4 + y * width * 4 + 0] = mask.mask[y][x] ? 255 : 0;
        d[x * 4 + y * width * 4 + 1] = mask.mask[y][x] ? 255 : 0;
        d[x * 4 + y * width * 4 + 2] = mask.mask[y][x] ? 255 : 0;
        d[x * 4 + y * width * 4 + 3] = 100;
      }
    context.putImageData(id, 0, 0);
  }, [mask]);

  return (
    <Group key={identifier}>
      <Image
        listening={false}
        key={identifier}
        image={canvasRef.current}
        onClick={onClick}
        x={0}
        y={0}
      />
    </Group>
  );
};
