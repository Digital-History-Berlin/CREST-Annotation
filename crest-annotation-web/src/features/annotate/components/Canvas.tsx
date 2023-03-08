import React from "react";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";
import { Layer, Stage } from "react-konva";
import BackgroundImage from "./BackgroundImage";
import LabelsPopup from "./LabelsPopup";
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
  updateAnnotation,
} from "../slice";
import { Line as LineShape } from "../tools/line";
import { Rectangle as RectangleShape } from "../tools/rectangle";
import { Circle as CircleShape } from "../tools/circle";
import { Polygon as PolygonShape } from "../tools/polygon";
import CircleComponent from "./tools/Circle";
import LineComponent from "./tools/Line";
import PolygonComponent from "./tools/Polygon";
import RectangleComponent from "./tools/Rectangle";
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

const shapeMap = {
  [Tool.Pen]: {
    render: LineComponent,
    create: (pos: { x: number; y: number }) => ({
      points: [pos.x, pos.y],
      tool: Tool.Pen,
      finished: false,
    }),
  },
  [Tool.Circle]: {
    render: CircleComponent,
    create: (pos: { x: number; y: number }) => ({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      tool: Tool.Rectangle,
    }),
  },
  [Tool.Rectangle]: {
    render: RectangleComponent,
    create: (pos: { x: number; y: number }) => ({
      x: pos.x,
      y: pos.y,
      radius: 0,
      tool: Tool.Circle,
    }),
  },
  [Tool.Polygon]: {
    render: PolygonComponent,
    create: (pos: { x: number; y: number }) => ({
      points: [pos.x, pos.y],
      preview: [pos.x, pos.y],
      finished: false,
      tool: Tool.Polygon,
    }),
  },
  [Tool.Select]: undefined,
  [Tool.Edit]: undefined,
};

const Canvas = ({ projectId, imageUri, annotationColor }: IProps) => {
  const dispatch = useAppDispatch();

  const stage = React.useRef<Konva.Stage>(null);

  const tool = useAppSelector(selectActiveTool);
  const activeLabel = useAppSelector(selectActiveLabel);
  const annotations = useAppSelector(selectAnnotations);

  // tracks the shape that is currently drawn
  const [activeShape, setActiveShape] = React.useState<Shape>();
  const [labelPopup, setLabelPopup] = React.useState<PopupPosition>();

  // gets the default cursor that is shown when hovering the canvas
  const defaultCursor = () => (tool === Tool.Select ? "pointer" : "crosshair");

  const toggleAnnotationSelection = (annotation: Annotation) => {
    if (tool === Tool.Select)
      annotation.selected
        ? dispatch(unselectAnnotation())
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
    const stage = event.target?.getStage();
    if (stage === undefined || stage === null) return;

    let pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    pos = correctCoordinatesForZoom(pos, stage);

    // right click - cancel
    if (event.evt instanceof MouseEvent)
      if (event.evt.button === 2) {
        cancelAnnotation();
        return;
      }

    // TODO: what should happen if the popup is open
    if (labelPopup) return;

    // if no shape is currently active, try to create a new shape
    if (activeShape === undefined) {
      console.log(pos);
      const shape = shapeMap[tool]?.create(pos);
      if (shape) setActiveShape(shape);
    } else if (activeShape.tool === Tool.Polygon) {
      // TODO: move somewhere else
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
  };

  const handleMouseMove = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // no drawing - skipping
    if (!activeShape || activeShape.locked) return;

    const stage = event.target?.getStage();
    if (stage === undefined || stage === null) return;

    let pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    pos = correctCoordinatesForZoom(pos, stage);

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
        let polygon = activeShape as PolygonShape;
        if (!polygon.finished) {
          setActiveShape({
            ...activeShape,
            preview: [pos.x, pos.y],
          });
        }
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
    const stage = event.target?.getStage();
    if (stage === undefined || stage === null) return;

    let pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    pos = correctCoordinatesForZoom(pos, stage);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!activeShape || activeShape.locked) return;

    if (activeShape.tool === Tool.Polygon) {
      // Hotkey for closing is pressed
      if (event.code === "KeyK" && event.ctrlKey) {
        let polygon = activeShape as PolygonShape;
        setActiveShape({
          ...activeShape,
          points: [...polygon.points, polygon.points[0], polygon.points[1]],
          finished: true,
          preview: [],
        });
      }
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!activeShape || activeShape.locked) return;

    if (event.code === "KeyK" && event.ctrlKey) {
      if (activeShape.tool === Tool.Polygon) {
        let polygon = activeShape as PolygonShape;
        if (!polygon.finished) return;

        if (activeLabel) {
          // label is pre-selected, create annotation right away
          createAnnotation(activeLabel);
          return;
        }

        // calculate a nice position
        const popupPos = {
          left: polygon.points[0] + 10,
          top: polygon.points[1],
          bottom: 2500,
        };

        // ensure shape does not change anymore
        setActiveShape({ ...activeShape, locked: true });
        setLabelPopup(popupPos);
      }
    }
  };

  function handleMouseWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();

    const stage = event.target?.getStage();
    if (stage === undefined || stage === null) return;

    const pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    const posCorrected = correctCoordinatesForZoom(pos, stage);

    const oldScale = stage.scaleX();

    const scaleBy = 1.03;
    const newScale =
      event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const newPos = {
      x: pos.x - posCorrected.x * newScale,
      y: pos.y - posCorrected.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
  }

  function correctCoordinatesForZoom(
    pos: { x: number; y: number },
    stage: Konva.Stage
  ) {
    return {
      x: (pos.x - stage.x()) / stage.scaleX(),
      y: (pos.y - stage.y()) / stage.scaleX(),
    };
  }

  const renderAnnotation = (
    annotation: Annotation,
    color: string,
    onClick?: () => void
  ) => {
    const annotationTool = annotation.shape?.tool;
    if (annotationTool === undefined) return;

    return shapeMap[annotationTool]?.render({
      annotation,
      color,
      editing: tool === Tool.Edit,
      onRequestCursor: (cursor) => {
        const container = stage.current?.container();
        if (container !== undefined)
          container.style.cursor = cursor ?? defaultCursor();
      },
      onUpdate: (annotation) => {
        dispatch(updateAnnotation(annotation));
      },
      shapeConfig: {
        stroke: alpha(color, 0.8),
        strokeWidth: annotation.selected ? 4 : 2,
        fill: alpha(color, 0.3),
        onClick: onClick,
        listening: tool !== Tool.Edit,
      },
    });
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
        <LabelsPopup
          projectId={projectId}
          onSelect={createAnnotation}
          onCancel={cancelAnnotation}
        />
      </div>
      <div tabIndex={0} onKeyUp={handleKeyUp} onKeyDown={handleKeyDown}>
        <Stage
          style={{ cursor: defaultCursor() }}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleMouseWheel}
          onContextMenu={(e) => e.evt.preventDefault()}
          draggable={tool === Tool.Select}
          ref={stage}
        >
          <Layer>
            {imageUri && <BackgroundImage imageUri={imageUri} />}
            {activeShape &&
              renderAnnotation(
                {
                  id: "__active__",
                  shape: activeShape,
                },
                activeLabel?.color ?? annotationColor
              )}
            {annotations.map(
              (annotation) =>
                annotation.shape &&
                !annotation.hidden &&
                renderAnnotation(
                  annotation,
                  annotation.label?.color ?? "#f00",
                  () => toggleAnnotationSelection(annotation)
                )
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

Canvas.defaultProps = defaultProps;

export default Canvas;
