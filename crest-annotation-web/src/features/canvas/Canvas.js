import React from "react";
import { Stage, Layer, Line, Text, Rect, Circle } from "react-konva";
import { BackgroundImage } from "../backgroundImage/BackgroundImage";

export function Canvas() {
  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState([]);
  const [boundingBoxes, setBoundingBoxes] = React.useState([]);
  const [newBoundingBox, setNewBoundingBox] = React.useState([]);
  const [boundingCircles, setBoundingCircles] = React.useState([]);
  const [newBoundingCircle, setNewBoundingCircle] = React.useState([]);

  const isDrawing = React.useRef(false);

  const handleMouseDown = (e) => {
    if (tool === "pen" || tool === "eraser") {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    } else if (tool === "boundingBox") {
      // if just started drawing a bounding box
      if (isDrawing.current === false) {
        isDrawing.current = true;
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewBoundingBox([{ x, y, width: 0, height: 0, key: "-1" }]);
      }
    } else if (tool === "boundingCircle") {
      // if just started drawing a bounding circle
      if (isDrawing.current === false) {
        isDrawing.current = true;
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewBoundingCircle([{ x, y, radius: 0, key: "-1" }]);
      }
    }
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    if (tool === "pen" || tool === "eraser") {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      let lastLine = lines[lines.length - 1];
      // add point
      lastLine.points = lastLine.points.concat([point.x, point.y]);

      // replace last
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    } else if (tool === "boundingBox") {
      if (isDrawing.current === true) {
        // update so user can see the bounding box live
        const old_x = newBoundingBox[0].x;
        const old_y = newBoundingBox[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewBoundingBox([
          {
            x: old_x,
            y: old_y,
            width: x - old_x,
            height: y - old_y,
            key: "-1",
          },
        ]);
      }
    } else if (tool === "boundingCircle") {
      if (isDrawing.current === true) {
        // update so user can see the bounding circle live
        const old_x = newBoundingCircle[0].x;
        const old_y = newBoundingCircle[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewBoundingCircle([
          {
            x: old_x,
            y: old_y,
            radius: Math.sqrt(Math.pow(x - old_x, 2) + Math.pow(y - old_y, 2)),
            key: "-1",
          },
        ]);
      }
    }
  };

  const handleMouseUp = (e) => {
    isDrawing.current = false;
    if (tool === "boundingBox") {
      const old_x = newBoundingBox[0].x;
      const old_y = newBoundingBox[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      const boundingBoxToAdd = {
        x: old_x,
        y: old_y,
        width: x - old_x,
        height: y - old_y,
        // give it a unique key when finished drawing
        key: boundingBoxes.length + 1,
      };
      boundingBoxes.push(boundingBoxToAdd);
      setBoundingBoxes(boundingBoxes);
      setNewBoundingBox([]);
    } else if (tool === "boundingCircle") {
      const old_x = newBoundingCircle[0].x;
      const old_y = newBoundingCircle[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      const boundingCircleToAdd = {
        x: old_x,
        y: old_y,
        radius: Math.sqrt(Math.pow(x - old_x, 2) + Math.pow(y - old_y, 2)),
        // give it a unique key when finished drawing
        key: boundingCircles.length + 1,
      };
      boundingCircles.push(boundingCircleToAdd);
      setBoundingCircles(boundingCircles);
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
      >
        <Layer>
          <BackgroundImage />
          <Text text="Just start drawing" x={5} y={30} />
          {boundingBoxesToDraw.map((value) => (
            <Rect
              x={value.x}
              y={value.y}
              width={value.width}
              height={value.height}
              fill={"transparent"}
              stroke={"red"}
            />
          ))}
          {boundingCirclesToDraw.map((value) => (
            <Circle
              x={value.x}
              y={value.y}
              radius={value.radius}
              fill={"transparent"}
              stroke={"red"}
            />
          ))}
          {lines.map((line, i) => (
            <Line
              key={i}
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
