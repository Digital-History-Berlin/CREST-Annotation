import React, { useEffect, useRef } from "react";
import { Group, Image } from "react-konva";
import { ShapeEventHandler, ShapeProps, ShapeTool } from "./Types";
import { Tool } from "../../slice/tools";
import { Mask as MaskShape } from "../../tools/mask";

const Mask = ({ identifier, shape, shapeConfig, onClick }: ShapeProps) => {
  const mask = shape as MaskShape;

  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!canvasRef.current)
      // create new canvas if neccessary
      canvasRef.current = document.createElement("canvas");
    const context = canvasRef.current.getContext("2d");

    if (!context) return;

    canvasRef.current.width = mask.width;
    canvasRef.current.height = mask.height;

    const { width, height } = mask;
    const id = context.createImageData(width, height);
    const d = id.data;

    console.log(shapeConfig?.opacity);

    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; y++) {
        d[x * 4 + y * width * 4 + 0] = 255;
        d[x * 4 + y * width * 4 + 1] = 0;
        d[x * 4 + y * width * 4 + 2] = 0;
        d[x * 4 + y * width * 4 + 3] = 30;
      }
    context.putImageData(id, 0, 0);
  }, [mask]);

  return (
    <Group key={identifier}>
      <Image
        key={identifier}
        image={canvasRef.current}
        onClick={onClick}
        x={mask.dx}
        y={mask.dy}
      />
    </Group>
  );
};

const onGestureClick: ShapeEventHandler = (shape) => {
  if (shape) return;

  return {
    mask: [],
    width: 1000,
    height: 500,
    dx: 100,
    dy: 300,
    tool: Tool.Segment,
    finished: true,
  };
};

const MaskTool: ShapeTool = {
  component: Mask,
  onGestureClick,
};

export default MaskTool;
