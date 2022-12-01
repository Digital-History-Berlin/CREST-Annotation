import React from "react";
import { Stage, Layer, Line, Text, Rect, Circle } from "react-konva";
import { BackgroundImage } from "../backgroundImage/BackgroundImage";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;

export function Canvas() {
  interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    key: number;
  }
  interface BoundingCircle {
    x: number;
    y: number;
    radius: number;
    key: number;
  }
  interface BoundingLine {
    tool: string;
    points: number[];
    key: number;
  }

  const [tool, setTool] = React.useState<string>("pen");
  const [lines, setLines] = React.useState<BoundingLine[]>([]);
  const [boundingBoxes, setBoundingBoxes] = React.useState<BoundingBox[]>([]);
  const [newBoundingBox, setNewBoundingBox] = React.useState<BoundingBox[]>([]);
  const [boundingCircles, setBoundingCircles] = React.useState<
    BoundingCircle[]
  >([]);
  const [newBoundingCircle, setNewBoundingCircle] = React.useState<
    BoundingCircle[]
  >([]);
  const isDrawing = React.useRef(false);

  const handleMouseDown = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const pos = event.target.getStage()?.getPointerPosition();
    if (pos === undefined || pos === null) return;

    if (tool === "pen" || tool === "eraser") {
      isDrawing.current = true;
      const newLine: BoundingLine = { tool, points: [pos.x, pos.y], key: -1 };
      setLines([...lines, newLine]);
    } else if (tool === "boundingBox") {
      // if just started drawing a bounding box
      if (!isDrawing.current) {
        isDrawing.current = true;
        const newBoundingBox: BoundingBox = {
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          key: -1,
        };
        setNewBoundingBox([newBoundingBox]);
      }
    } else if (tool === "boundingCircle") {
      // if just started drawing a bounding circle
      if (!isDrawing.current) {
        isDrawing.current = true;
        const newBoundingCircle: BoundingCircle = {
          x: pos.x,
          y: pos.y,
          radius: 0,
          key: -1,
        };
        setNewBoundingCircle([newBoundingCircle]);
      }
    }
  };

  const handleMouseMove = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    const pos = event.target.getStage()?.getPointerPosition();
    if (pos === undefined || pos === null) return;

    if (tool === "pen" || tool === "eraser") {
      let lastLine = lines[lines.length - 1];
      // add point
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);

      // replace last
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    } else if (tool === "boundingBox") {
      if (isDrawing.current) {
        // update so user can see the bounding box live
        const old_x = newBoundingBox[0].x;
        const old_y = newBoundingBox[0].y;
        const updatedBoundingBox: BoundingBox = {
          x: old_x,
          y: old_y,
          width: pos.x - old_x,
          height: pos.y - old_y,
          key: -1,
        };
        setNewBoundingBox([updatedBoundingBox]);
      }
    } else if (tool === "boundingCircle") {
      if (!isDrawing.current) {
        // update so user can see the bounding circle live
        const old_x = newBoundingCircle[0].x;
        const old_y = newBoundingCircle[0].y;
        const updatedBoundingCircle: BoundingCircle = {
          x: old_x,
          y: old_y,
          radius: Math.sqrt(
            Math.pow(pos.x - old_x, 2) + Math.pow(pos.y - old_y, 2)
          ),
          key: -1,
        };
        setNewBoundingCircle([updatedBoundingCircle]);
      }
    }
  };

  const handleMouseUp = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    isDrawing.current = false;
    const pos = event.target.getStage()?.getPointerPosition();
    if (pos === undefined || pos === null) return;

    if (tool === "pen" || tool === "eraser") {
      let lastLine = lines[lines.length - 1];
      lastLine.key = lines.length - 1;
      // replace last
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    } else if (tool === "boundingBox") {
      const old_x = newBoundingBox[0].x;
      const old_y = newBoundingBox[0].y;
      const boundingBoxToAdd: BoundingBox = {
        x: old_x,
        y: old_y,
        width: pos.x - old_x,
        height: pos.y - old_y,
        // give it a unique key when finished drawing
        key: boundingBoxes.length,
      };
      setBoundingBoxes([...boundingBoxes, boundingBoxToAdd]);
      setNewBoundingBox([]);
    } else if (tool === "boundingCircle") {
      const old_x = newBoundingCircle[0].x;
      const old_y = newBoundingCircle[0].y;
      const boundingCircleToAdd: BoundingCircle = {
        x: old_x,
        y: old_y,
        radius: Math.sqrt(
          Math.pow(pos.x - old_x, 2) + Math.pow(pos.y - old_y, 2)
        ),
        // give it a unique key when finished drawing
        key: boundingCircles.length,
      };
      setBoundingCircles([...boundingCircles, boundingCircleToAdd]);
      setNewBoundingCircle([]);
    }
  };

  const boundingBoxesToDraw = boundingBoxes.concat(newBoundingBox);
  const boundingCirclesToDraw = boundingCircles.concat(newBoundingCircle);
  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          <BackgroundImage />
          <Text text="Just start drawing" x={5} y={30} />
          {boundingBoxesToDraw.map((box) => (
            <Rect
              key={box.key}
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              fill={"transparent"}
              stroke={"red"}
            />
          ))}
          {boundingCirclesToDraw.map((circle) => (
            <Circle
              key={circle.key}
              x={circle.x}
              y={circle.y}
              radius={circle.radius}
              fill={"transparent"}
              stroke={"red"}
            />
          ))}
          {lines.map((line) => (
            <Line
              key={line.key}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
      <select
        style={{ position: "absolute", top: "5px", left: "5px" }}
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
        <option value="boundingBox">Bounding-Box</option>
        <option value="boundingCircle">Bounding-Circle</option>
      </select>
    </div>
  );
}
