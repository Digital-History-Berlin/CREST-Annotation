import React, { useEffect, useRef, useState } from "react";
import { Group, Image } from "react-konva";
import { ShapeFC, ShapeType } from "../../types/shapes";

export interface MaskShape {
  type: ShapeType.Mask;
  mask: number[][];
  width: number;
  height: number;
  dx: number;
  dy: number;
  preview: boolean;
}

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

export const Mask: ShapeFC<MaskShape> = ({
  identifier,
  shape,
  solidColor,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    if (!canvasRef.current)
      // create new canvas if neccessary
      canvasRef.current = document.createElement("canvas");
    const context = canvasRef.current.getContext("2d");

    if (!context || !shape.width || !shape.height || !solidColor) return;

    const { width, height } = shape;
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const id = context.createImageData(width, height);
    const d = id.data;

    const foreground = shape.preview
      ? { red: 255, green: 255, blue: 255, alpha: 100 }
      : hexToRgbA(solidColor, 100);
    const background = shape.preview
      ? { red: 0, green: 0, blue: 0, alpha: 100 }
      : { red: 0, green: 0, blue: 0, alpha: 0 };

    console.log(`(Re-)rendering mask...`);
    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; y++) {
        d[x * 4 + y * width * 4 + 0] = shape.mask[y][x]
          ? foreground.red
          : background.red;
        d[x * 4 + y * width * 4 + 1] = shape.mask[y][x]
          ? foreground.green
          : background.green;
        d[x * 4 + y * width * 4 + 2] = shape.mask[y][x]
          ? foreground.blue
          : background.blue;
        d[x * 4 + y * width * 4 + 3] = shape.mask[y][x]
          ? foreground.alpha
          : background.alpha;
      }
    console.log("Storing rendering...");
    context.putImageData(id, 0, 0);
    console.log("Rendering done");
    // enforce component re-render
    setImageKey((value) => value + 1);
  }, [shape, solidColor]);

  return (
    <Group key={identifier}>
      <Image
        listening={false}
        key={`${identifier}-${imageKey}`}
        image={canvasRef.current}
        onClick={onClick}
        x={0}
        y={0}
      />
    </Group>
  );
};
