import React from "react";
import { Stage, Layer, Line, Text, Rect, Circle } from "react-konva";
import { BackgroundImage } from "../backgroundImage/BackgroundImage";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;

export function Canvas() {
  type BoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
    key: number;
  };
  type BoundingCircle = {
    x: number;
    y: number;
    radius: number;
    key: number;
  };
  type BoundingLine = {
    tool: string;
    points: number[];
    key: number;
  };

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

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    const x = event.evt.x;
    const y = event.evt.y;

    if (tool === "pen" || tool === "eraser") {
      isDrawing.current = true;
      const newLine: BoundingLine = { tool, points: [x, y], key: -1 };
      setLines([...lines, newLine]);
    } else if (tool === "boundingBox") {
      // if just started drawing a bounding box
      if (!isDrawing.current) {
        isDrawing.current = true;
        const newBoundingBox: BoundingBox = {x, y, width: 0, height: 0, key: -1};
        setNewBoundingBox([newBoundingBox]);
      }
    } else if (tool === "boundingCircle") {
      // if just started drawing a bounding circle
      if (!isDrawing.current) {
        isDrawing.current = true;
        const newBoundingCircle: BoundingCircle = {x, y, radius: 0, key: -1};
        setNewBoundingCircle([newBoundingCircle]);
      }
    }
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    // console.log("mouse move");
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    const x = event.evt.x;
    const y = event.evt.y;

    if (tool === "pen" || tool === "eraser") {
      let lastLine = lines[lines.length - 1];
      // add point
      lastLine.points = lastLine.points.concat([x, y]);

      // replace last
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    } else if (tool === "boundingBox") {
      if (!isDrawing.current) {
        // update so user can see the bounding box live
        const old_x = newBoundingBox[0].x;
        const old_y = newBoundingBox[0].y;
        const updatedBoundingBox: BoundingBox = {x: old_x, y: old_y, width: x - old_x, height: y - old_y, key: -1,};
        setNewBoundingBox([updatedBoundingBox]);
      }
    } else if (tool === "boundingCircle") {
      if (!isDrawing.current) {
        // update so user can see the bounding circle live
        const old_x = newBoundingCircle[0].x;
        const old_y = newBoundingCircle[0].y;
        const updatedBoundingCircle: BoundingCircle ={
          x: old_x,
          y: old_y,
          radius: Math.sqrt(Math.pow(x - old_x, 2) + Math.pow(y - old_y, 2)),
          key: -1,
        }
        setNewBoundingCircle([updatedBoundingCircle]);
      }
    }
  };

  const handleMouseUp = (event: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = false;
    const x = event.evt.x;
    const y = event.evt.y;

    if(tool === "pen" || tool === "eraser") {
      console.log("here");
      let lastLine = lines[lines.length - 1];
      lastLine.key = lines.length -1;
      // replace last
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());

    } else if (tool === "boundingBox") {
      const old_x = newBoundingBox[0].x;
      const old_y = newBoundingBox[0].y;
      const boundingBoxToAdd: BoundingBox = {
        x: old_x,
        y: old_y,
        width: x - old_x,
        height: y - old_y,
        // give it a unique key when finished drawing
        key: boundingBoxes.length,
      };
      setBoundingBoxes([...boundingBoxes, boundingBoxToAdd]);
      setNewBoundingBox([]);

    } else if (tool === "boundingCircle") {
      const old_x = newBoundingCircle[0].x;
      const old_y = newBoundingCircle[0].y;
      const boundingCircleToAdd : BoundingCircle = {
        x: old_x,
        y: old_y,
        radius: Math.sqrt(Math.pow(x - old_x, 2) + Math.pow(y - old_y, 2)),
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
        //onTouchStart={handleMouseDown}
        //onTouchMove={handleMouseMove}
        //onTouchEnd={handleMouseUp}
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
