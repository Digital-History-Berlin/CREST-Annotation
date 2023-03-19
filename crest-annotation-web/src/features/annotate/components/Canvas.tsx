import React, { useRef, useState } from "react";
import { alpha } from "@mui/material";
import Konva from "konva";
import { Layer, Stage } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import BackgroundImage from "./BackgroundImage";
import LabelsPopup from "./LabelsPopup";
import CircleTool from "./tools/Circle";
import LineTool from "./tools/Line";
import PolygonTool from "./tools/Polygon";
import RectangleTool from "./tools/Rectangle";
import { Position, Transformation } from "./tools/Shape";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  Annotation,
  Shape,
  Tool,
  addAnnotation,
  selectActiveLabel,
  selectActiveTool,
  selectAnnotation,
  selectAnnotations,
  unselectAnnotation,
  updateAnnotation,
} from "../slice";

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
  [Tool.Pen]: LineTool,
  [Tool.Circle]: CircleTool,
  [Tool.Rectangle]: RectangleTool,
  [Tool.Polygon]: PolygonTool,
  [Tool.Select]: undefined,
  [Tool.Edit]: undefined,
};

const Canvas = ({ projectId, imageUri, annotationColor }: IProps) => {
  const dispatch = useAppDispatch();

  const stage = useRef<Konva.Stage>(null);

  const tool = useAppSelector(selectActiveTool);
  const activeLabel = useAppSelector(selectActiveLabel);
  const annotations = useAppSelector(selectAnnotations);

  // tracks the shape that is currently drawn
  const [activeShape, setActiveShape] = useState<Shape>();
  const [labelPopup, setLabelPopup] = useState<PopupPosition>();
  const [cursorPos, setCursorPos] = useState<Position>({ x: 0, y: 0 });

  // gets the default cursor that is shown when hovering the canvas
  const defaultCursor = () => (tool === Tool.Select ? "pointer" : "crosshair");

  const toggleAnnotationSelection = (annotation: Annotation) => {
    if (tool === Tool.Select)
      annotation.selected
        ? dispatch(unselectAnnotation())
        : dispatch(selectAnnotation(annotation));
  };

  const createAnnotation = (label: Label, shape: Shape) => {
    dispatch(
      addAnnotation({
        shape: shape,
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

  const displayPopup = (pos?: Position) => {
    if (!stage.current) return;

    // use cursor position if no explicit position is given
    const { x, y } = pos ?? cursorPos;

    // calculate a nice position
    const popupPos = {
      left: x + 10,
      top: y <= stage.current.height() / 2 ? y : undefined,
      bottom:
        y > stage.current.height() / 2 ? stage.current.height() - y : undefined,
    };

    // ensure shape does not change anymore
    setLabelPopup(popupPos);
  };

  const updateActiveShape = (shape: Shape): void => {
    if (!shape.finished) {
      // shape not yet finished, update active shape
      setActiveShape(shape);
      return;
    }

    if (activeLabel) {
      // label is pre-selected, create annotation right away
      createAnnotation(activeLabel, shape);
      return;
    }

    // label is to be selected, display popup
    setActiveShape(shape);
    displayPopup();
  };

  const getTransformedPointerPosition = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ): Position | undefined => {
    const stage = event.target?.getStage();
    if (stage === undefined || stage === null) return;

    const pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    return transform(pos);
  };

  const handleMouseDown = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const pos = getTransformedPointerPosition(event);
    if (pos === undefined) return;

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
      const shape = shapeMap[tool]?.onCreate(pos);
      if (shape) updateActiveShape(shape);
    }

    // active shape found, forward to component
    else if (!activeShape.finished) {
      const shape = shapeMap[tool]?.onDown?.(activeShape, pos);
      if (shape) updateActiveShape(shape);
    }
  };

  const handleMouseMove = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const stage = event.target?.getStage();
    if (stage === undefined || stage === null) return;

    const pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    // store cursor position so it is available outside of events
    // (used to display popup near cursor position)
    setCursorPos(pos);

    // no drawing - skipping
    if (!activeShape || activeShape.finished) return;

    const transformed = transform(pos, stage);
    const shape = shapeMap[tool]?.onMove?.(activeShape, transformed);
    if (shape) updateActiveShape(shape);
  };

  const handleMouseUp = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // no drawing - skipping
    if (!activeShape || activeShape.finished) return;

    const pos = getTransformedPointerPosition(event);
    if (pos === undefined) return;

    const shape = shapeMap[tool]?.onUp?.(activeShape, pos);
    if (shape) updateActiveShape(shape);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!activeShape || activeShape.finished) return;

    const shape = shapeMap[tool]?.onKeyDown?.(activeShape, event);
    if (shape) updateActiveShape(shape);
  };

  function handleMouseWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();

    const stage = event.target?.getStage();
    if (stage === undefined || stage === null) return;

    const pos = stage.getPointerPosition();
    if (pos === undefined || pos === null) return;

    const posCorrected = transform(pos, stage);

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

  const transform = ((
    pos: { x: number; y: number },
    activeStage?: Konva.Stage
  ) => {
    if (!activeStage) {
      if (!stage.current) return undefined;
      activeStage = stage.current;
    }

    return {
      x: (pos.x - activeStage.x()) / activeStage.scaleX(),
      y: (pos.y - activeStage.y()) / activeStage.scaleX(),
    };
  }) as Transformation;

  const renderAnnotation = (
    annotation: Annotation,
    color: string,
    onClick?: () => void
  ) => {
    const annotationTool = annotation.shape?.tool;
    if (annotationTool === undefined) return;

    const Component = shapeMap[annotationTool]?.component;
    if (!Component) return undefined;

    return (
      <Component
        annotation={annotation}
        color={color}
        editing={tool === Tool.Edit}
        onRequestCursor={(cursor) => {
          const container = stage.current?.container();
          if (container !== undefined)
            container.style.cursor = cursor ?? defaultCursor();
        }}
        onUpdate={(annotation) => {
          dispatch(updateAnnotation(annotation));
        }}
        shapeConfig={{
          stroke: alpha(color, 0.8),
          strokeWidth: annotation.selected ? 4 : 2,
          fill: alpha(color, 0.3),
          onClick: onClick,
          listening: tool !== Tool.Edit,
        }}
        getTransformedPointerPosition={getTransformedPointerPosition}
      />
    );
  };

  return (
    <div style={{ position: "relative", display: "flex", overflow: "hidden" }}>
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
          onSelect={(label) =>
            activeShape && createAnnotation(label, activeShape)
          }
          onCancel={cancelAnnotation}
        />
      </div>
      <div tabIndex={0} onKeyDown={handleKeyDown}>
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
