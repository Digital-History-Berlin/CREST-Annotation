import React from "react";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import BackgroundImage from "./BackgroundImage";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  addAnnotation,
  selectActiveTool,
  selectAnnotations,
  Shape,
  Tool,
} from "../slice";
import { Line as LineShape } from "../tools/line";
import { Rectangle as RectangleShape } from "../tools/rectangle";
import { Circle as CircleShape } from "../tools/circle";
import { Polygon as PolygonShape } from "../tools/polygon";

interface IProps {
  imageUri?: string;
}

const defaultProps = {};

const Canvas = ({ imageUri }: IProps) => {
  const dispatch = useAppDispatch();

  const tool = useAppSelector(selectActiveTool);
  const annotations = useAppSelector(selectAnnotations);

  // tracks the shape that is currently drawn
  const [activeShape, setActiveShape] = React.useState<Shape>();

  const handleMouseDown = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const pos = event.target.getStage()?.getPointerPosition();
    if (pos === undefined || pos === null) return;

    switch (tool) {
      case Tool.Pen: {
        setActiveShape({
          points: [pos.x, pos.y],
          tool: Tool.Pen,
        });
        break;
      }
      case Tool.Rectangle: {
        setActiveShape({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          tool: Tool.Rectangle,
        });
        break;
      }
      case Tool.Circle: {
        setActiveShape({
          x: pos.x,
          y: pos.y,
          radius: 0,
          tool: Tool.Circle,
        });
        break;
      }
      case Tool.Polygon: {
        // check if we just started drawing the first point of the polygon
        if (activeShape === undefined) {
          setActiveShape({
            points: [pos.x, pos.y],
            finished: false,
            tool: Tool.Polygon,
          });
        } else {
          let polygon = activeShape as PolygonShape;
          // finish drawing polygon, if area around starting point is clicked
          if (
            Math.abs(pos.x - polygon.points[0]) <= 5 &&
            Math.abs(pos.y - polygon.points[1]) <= 5
          ) {
            // add last point, which is the same as the first point
            setActiveShape({
              ...activeShape,
              points: [...polygon.points, polygon.points[0], polygon.points[1]],
              finished: true,
            });
            // otherwise add new point
          } else {
            setActiveShape({
              ...activeShape,
              points: [...polygon.points, pos.x, pos.y],
            });
          }
        }
        break;
      }
    }
  };

  const handleMouseMove = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // no drawing - skipping
    if (!activeShape) return;

    const pos = event.target.getStage()?.getPointerPosition();
    if (pos === undefined || pos === null) return;

    switch (activeShape.tool) {
      case Tool.Pen: {
        let line = activeShape as LineShape;

        setActiveShape({
          ...activeShape,
          points: [...line.points, pos.x, pos.y],
        });
        break;
      }
      case Tool.Rectangle: {
        let rectangle = activeShape as RectangleShape;

        setActiveShape({
          ...activeShape,
          width: pos.x - rectangle.x,
          height: pos.y - rectangle.y,
        });
        break;
      }
      case Tool.Circle: {
        let circle = activeShape as CircleShape;

        setActiveShape({
          ...activeShape,
          radius: Math.sqrt(
            Math.pow(pos.x - circle.x, 2) + Math.pow(pos.y - circle.y, 2)
          ),
        });
      }
    }
  };

  const handleMouseUp = () => {
    // no drawing - skipping
    if (!activeShape) return;

    if (activeShape.tool === Tool.Polygon) {
      let polygon = activeShape as PolygonShape;
      if (polygon.finished) {
        dispatch(
          addAnnotation({
            shape: activeShape,
            id: uuidv4(),
          })
        );
        setActiveShape(undefined);
      }
    } else {
      dispatch(
        addAnnotation({
          shape: activeShape,
          id: uuidv4(),
        })
      );
      setActiveShape(undefined);
    }
  };

  const renderShape = (shape: Shape, key?: string) => {
    switch (shape.tool) {
      case Tool.Pen:
        const line = shape as LineShape;
        return (
          <Line
            key={key}
            points={line.points}
            stroke="#df4b26"
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
            globalCompositeOperation="source-over"
          />
        );
      case Tool.Rectangle:
        const rectangle = shape as RectangleShape;
        return (
          <Rect
            key={key}
            x={rectangle.x}
            y={rectangle.y}
            width={rectangle.width}
            height={rectangle.height}
            fill={"transparent"}
            stroke={"red"}
          />
        );
      case Tool.Circle:
        const circle = shape as CircleShape;
        return (
          <Circle
            key={key}
            x={circle.x}
            y={circle.y}
            radius={circle.radius}
            fill={"transparent"}
            stroke={"red"}
          />
        );
      case Tool.Polygon:
        const polygon = shape as PolygonShape;
        return (
          <Line
            key={key}
            points={polygon.points}
            closed={polygon.finished}
            stroke="#df4b26"
            strokeWidth={5}
            tension={0}
            lineCap="round"
            fill="rgba(255,0,0,0.4)"
          />
        );
      default:
        return null;
    }
  };

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
          {imageUri && <BackgroundImage imageUri={imageUri} />}
          {activeShape && renderShape(activeShape)}
          {annotations.map(
            (annotation) =>
              annotation.shape && renderShape(annotation.shape, annotation.id)
          )}
        </Layer>
      </Stage>
    </div>
  );
};

Canvas.defaultProps = defaultProps;

export default Canvas;
