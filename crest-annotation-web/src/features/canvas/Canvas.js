import React from "react";
import { Stage, Layer, Line, Text, Rect } from "react-konva";
import { BackgroundImage } from "../backgroundImage/BackgroundImage";

export function Canvas() {
  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState([]);
  const [boundingBoxes, setBoundingBoxes] = React.useState([]);
  const [newBoundingBox, setNewBoundingBox] = React.useState([]);

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
        const sx = newBoundingBox[0].x;
        const sy = newBoundingBox[0].y;
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewBoundingBox([
          {
            x: sx,
            y: sy,
            width: x - sx,
            height: y - sy,
            key: "-1",
          },
        ]);
      }
    }
  };

  const handleMouseUp = (e) => {
    isDrawing.current = false;
    if (tool === "boundingBox") {
      const sx = newBoundingBox[0].x;
      const sy = newBoundingBox[0].y;
      const { x, y } = e.target.getStage().getPointerPosition();
      const boundingBoxToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        // give it a unique key when finished drawing
        key: boundingBoxes.length + 1,
      };
      boundingBoxes.push(boundingBoxToAdd);
      setBoundingBoxes(boundingBoxes);
      setNewBoundingBox([]);
    }
  };

  const boundingBoxesToDraw = boundingBoxes.concat(newBoundingBox);
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
      </select>
    </div>
  );
}
