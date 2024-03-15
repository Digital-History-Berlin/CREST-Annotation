import React, { useEffect, useRef } from "react";
import { Group, Image } from "react-konva";
import { ShapeProps } from "./Types";
import { Mask as MaskShape } from "../../tools/mask";

const colorRegex =
  /#([a-fA-F0-9][a-fA-F0-9])([a-fA-F0-9][a-fA-F0-9])([a-fA-F0-9][a-fA-F0-9])/;

const hexToRgbA = (hex: string, alpha: number) => {
  const match = hex.match(colorRegex);

  if (match)
    return {
      red: parseInt(match[1], 16),
      green: parseInt(match[2], 16),
      blue: parseInt(match[3], 16),
      alpha,
    };

  return { red: 255, green: 255, blue: 255, alpha };
};

export const Mask = ({ identifier, shape, color, onClick }: ShapeProps) => {
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

    const foreground = mask.preview
      ? { red: 255, green: 255, blue: 255, alpha: 100 }
      : hexToRgbA(color, 100);
    const background = mask.preview
      ? { red: 0, green: 0, blue: 0, alpha: 100 }
      : { red: 0, green: 0, blue: 0, alpha: 0 };

    console.log("(Re-)rendering mask...");
    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; y++) {
        d[x * 4 + y * width * 4 + 0] = mask.mask[y][x]
          ? foreground.red
          : background.red;
        d[x * 4 + y * width * 4 + 1] = mask.mask[y][x]
          ? foreground.green
          : background.green;
        d[x * 4 + y * width * 4 + 2] = mask.mask[y][x]
          ? foreground.blue
          : background.blue;
        d[x * 4 + y * width * 4 + 3] = mask.mask[y][x]
          ? foreground.alpha
          : background.alpha;
      }
    console.log("Storing rendering...");
    context.putImageData(id, 0, 0);
    console.log("Rendering done");
  }, [mask, color]);

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
