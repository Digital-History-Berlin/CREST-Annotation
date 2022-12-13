import React from "react";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import BackgroundImage from "./BackgroundImage";
import LabelsList from "./LabelsList";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  addAnnotation,
  Annotation,
  selectActiveLabel,
  selectActiveTool,
  selectAnnotation,
  selectAnnotations,
  Shape,
  Tool,
  unselectAnnotation,
} from "../slice";
import { Line as LineShape } from "../tools/line";
import { Rectangle as RectangleShape } from "../tools/rectangle";
import { Circle as CircleShape } from "../tools/circle";
import { Polygon as PolygonShape } from "../tools/polygon";
import { Label } from "../../../api/openApi";
import { alpha } from "@mui/material";

interface PopupPosition {
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
}

interface IProps {
  projectId?: string;
  imageUri?: string;
  annotationColor: string;
}

const defaultProps = { annotationColor: "#D00000" };

const Canvas = ({ projectId, imageUri, annotationColor }: IProps) => {
  const dispatch = useAppDispatch();

  const tool = useAppSelector(selectActiveTool);
  const activeLabel = useAppSelector(selectActiveLabel);
  const annotations = useAppSelector(selectAnnotations);

  // tracks the shape that is currently drawn
  const [activeShape, setActiveShape] = React.useState<Shape>();
  const [labelPopup, setLabelPopup] = React.useState<PopupPosition>();

  const toggleAnnotationSelection = (annotation: Annotation) => {
    if (tool === Tool.Select)
      annotation.selected
        ? dispatch(unselectAnnotation(annotation))
        : dispatch(selectAnnotation(annotation));
  };

  const createAnnotation = (label: Label) => {
    dispatch(
      addAnnotation({
        shape: activeShape,
        label: label,
        id: uuidv4(),
      })
    );

    setActiveShape(undefined);
    setLabelPopup(undefined);
  };

  const cancelAnnotation = () => {
    setActiveShape(undefined);
    setLabelPopup(undefined);
  };

  const handleMouseDown = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const pos = event.target.getStage()?.getPointerPosition();
    if (pos === undefined || pos === null) return;

    // right click - cancel
    if (event.evt instanceof MouseEvent)
      if (event.evt.button === 2) {
        cancelAnnotation();
        return;
      }

    // TODO: what should happen if the popup is open
    if (labelPopup) return;

    switch (tool) {
      case Tool.Pen: {
        setActiveShape({
          points: [pos.x, pos.y],
          tool: Tool.Pen,
          finished: false,
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
            preview: [pos.x, pos.y],
            finished: false,
            tool: Tool.Polygon,
          });
        } else {
          let polygon = activeShape as PolygonShape;
          let count = polygon.points.length;

          let first = { x: polygon.points[0], y: polygon.points[1] };
          let last = {
            x: polygon.points[count - 2],
            y: polygon.points[count - 1],
          };

          // finish drawing polygon
          // - if area around starting point is clicked
          // - if area around current point is clicked (double click)
          if (
            (Math.abs(pos.x - last.x) <= 5 && Math.abs(pos.y - last.y) <= 5) ||
            (Math.abs(pos.x - first.x) <= 5 && Math.abs(pos.y - first.y) <= 5)
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
    if (!activeShape || activeShape.locked) return;

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
        break;
      }
      case Tool.Polygon: {
        setActiveShape({
          ...activeShape,
          preview: [pos.x, pos.y],
        });
        break;
      }
    }
  };

  const handleMouseUp = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // no drawing - skipping
    if (!activeShape || activeShape.locked) return;

    if (activeShape.tool === Tool.Polygon) {
      let polygon = activeShape as PolygonShape;
      // polygon still open
      if (!polygon.finished) return;
      // clear polygon preview line
      polygon.preview = [];
    }

    if (activeShape.tool === Tool.Pen) {
      (activeShape as LineShape).finished = true;
    }

    if (activeLabel) {
      // label is pre-selected, create annotation right away
      createAnnotation(activeLabel);
      return;
    }

    // no label selected, show popup
    const stage = event.target.getStage();
    const pos = stage?.getPointerPosition();
    if (stage === null || pos === null || pos === undefined) return;

    // calculate a nice position
    const popupPos = {
      left: pos.x + 10,
      top: pos.y <= stage.height() / 2 ? pos.y : undefined,
      bottom: pos.y > stage.height() / 2 ? stage.height() - pos.y : undefined,
    };

    // ensure shape does not change anymore
    setActiveShape({ ...activeShape, locked: true });
    setLabelPopup(popupPos);
  };

  const renderShape = (
    shape: Shape,
    color: string,
    key?: string,
    selected?: boolean,
    onClick?: () => void
  ) => {
    const common = {
      key: key,
      stroke: alpha(color, 0.8),
      strokeWidth: selected ? 4 : 2,
      fill: alpha(color, 0.3),
      onClick: onClick,
    };

    switch (shape.tool) {
      case Tool.Pen:
        const line = shape as LineShape;
        return (
          <Line
            {...common}
            points={line.points}
            closed={line.finished}
            tension={0.5}
            lineCap="round"
            globalCompositeOperation="source-over"
          />
        );
      case Tool.Rectangle:
        const rectangle = shape as RectangleShape;
        return (
          <Rect
            {...common}
            x={rectangle.x}
            y={rectangle.y}
            width={rectangle.width}
            height={rectangle.height}
          />
        );
      case Tool.Circle:
        const circle = shape as CircleShape;
        return (
          <Circle
            {...common}
            x={circle.x}
            y={circle.y}
            radius={circle.radius}
          />
        );
      case Tool.Polygon:
        const polygon = shape as PolygonShape;
        return (
          <Line
            {...common}
            points={polygon.points.concat(polygon.preview)}
            closed={polygon.finished}
            stroke={alpha(color, 0.8)}
            tension={0}
            lineCap="round"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          ...labelPopup,
          display: labelPopup ? "block" : "none",
          position: "absolute",
          backgroundColor: "white",
          zIndex: 1500,
        }}
      >
        <LabelsList
          projectId={projectId}
          onSelect={createAnnotation}
          onCancel={cancelAnnotation}
        />
      </div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer>
          {imageUri && <BackgroundImage imageUri={imageUri} />}
          {activeShape &&
            renderShape(activeShape, activeLabel?.color ?? annotationColor)}
          {annotations.map(
            (annotation) =>
              annotation.shape &&
              !annotation.hidden &&
              renderShape(
                annotation.shape,
                annotation.label?.color ?? annotationColor,
                annotation.id,
                annotation.selected,
                () => toggleAnnotationSelection(annotation)
              )
          )}
        </Layer>
      </Stage>
    </div>
  );
};

Canvas.defaultProps = defaultProps;

export default Canvas;
