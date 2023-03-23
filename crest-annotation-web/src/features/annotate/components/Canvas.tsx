import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, alpha } from "@mui/material";
import Konva from "konva";
import { Layer, Stage } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import BackgroundImage from "./BackgroundImage";
import LabelsPopup from "./LabelsPopup";
import CircleTool from "./tools/Circle";
import LineTool from "./tools/Line";
import PolygonTool from "./tools/Polygon";
import RectangleTool from "./tools/Rectangle";
import { Position } from "./tools/Shape";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  Annotation,
  Modifiers,
  Shape,
  Tool,
  Transformation,
  addAnnotation,
  selectActiveAnnotation,
  selectActiveLabel,
  selectActiveModifiers,
  selectActiveTool,
  selectAnnotation,
  selectAnnotations,
  selectTransformation,
  unselectAnnotation,
  updateActiveAnnotation,
  updateAnnotation,
  updateShape,
  updateTransformation,
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

  const container = useRef<HTMLDivElement>(null);
  const stage = useRef<Konva.Stage>(null);

  const tool = useAppSelector(selectActiveTool);
  const activeLabel = useAppSelector(selectActiveLabel);
  const activeAnnotation = useAppSelector(selectActiveAnnotation);
  const modifiers = useAppSelector(selectActiveModifiers);
  const annotations = useAppSelector(selectAnnotations);
  const transformation = useAppSelector(selectTransformation);

  // tracks the shape that is currently drawn
  const [activeShape, setActiveShape] = useState<Shape>();
  const [labelPopup, setLabelPopup] = useState<PopupPosition>();
  const [cursorPos, setCursorPos] = useState<Position>({ x: 0, y: 0 });
  const [_, setImageSize] = useState<Position>();

  // allow to complete an annotation by selecting a label in the sidebar
  // (in case the popup has already been opened)
  useEffect(() => {
    if (labelPopup && activeLabel && activeShape)
      createAnnotation(activeLabel, activeShape);
    // this should explicitly only trigger when the active label changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLabel]);

  // update the zoom on change
  useEffect(() => {
    stage.current?.scale({ x: transformation.scale, y: transformation.scale });
    stage.current?.position(transformation.translate);
  }, [transformation]);

  // clamp and apply given transformation
  const transformValid = (transformation: Transformation) => {
    if (!stage.current || !container.current) return;

    // TODO: clamp transformation
    dispatch(updateTransformation(transformation));
  };

  const resize = useCallback(
    (width: number, height: number) => {
      setImageSize({ x: width, y: height });
      // reset the current transformation
      if (container.current)
        dispatch(
          updateTransformation({
            translate: { x: 0, y: 0 },
            // fit image into container height
            scale: container.current?.clientHeight / height,
          })
        );
    },
    [dispatch]
  );

  // gets the default cursor that is shown when hovering the canvas
  const defaultCursor = () => (tool === Tool.Select ? "pointer" : "crosshair");
  // change the current cursor
  const changeCursor = (cursor: string | undefined) => {
    const container = stage.current?.container();
    if (container !== undefined)
      container.style.cursor = cursor ?? defaultCursor();
  };

  // select or deselect given annotation
  const toggleAnnotationSelection = (annotation: Annotation) => {
    if (tool === Tool.Select)
      annotation.selected
        ? dispatch(unselectAnnotation())
        : dispatch(selectAnnotation(annotation));
  };

  // create new annotation with given label and shape
  const createAnnotation = (label: Label, shape: Shape) => {
    if (modifiers.includes(Modifiers.Group) && activeAnnotation) {
      const newShapes = [...(activeAnnotation.shapes || []), shape];
      const newAnnotation = { ...activeAnnotation, shapes: newShapes };
      dispatch(updateAnnotation(newAnnotation));
      dispatch(updateActiveAnnotation(newAnnotation));
    } else
      dispatch(
        addAnnotation({
          shapes: [shape],
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
    const cancel =
      // right click
      (event.evt instanceof MouseEvent && event.evt.button === 2) ||
      // popup open
      labelPopup;

    if (cancel) {
      cancelAnnotation();
      return;
    }

    const ignore = event.evt instanceof MouseEvent && event.evt.button === 1;
    if (ignore) return;

    const pos = getTransformedPointerPosition(event);
    if (pos === undefined) return;

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

    const translate =
      (event.evt instanceof MouseEvent && event.evt.buttons === 4) ||
      (tool === Tool.Select &&
        event.evt instanceof MouseEvent &&
        event.evt.buttons) ||
      (tool === Tool.Select && event.evt instanceof TouchEvent);

    if (translate) {
      transformValid({
        ...transformation,
        translate: {
          x: transformation.translate.x + pos.x - cursorPos.x,
          y: transformation.translate.y + pos.y - cursorPos.y,
        },
      });
      return;
    }

    // no drawing - skipping
    if (!activeShape || activeShape.finished) return;

    const transformed = transform(pos);
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
    const transformed = transform(pos);

    // TODO: maybe configure
    const distance = event.evt.deltaY * 0.01;
    const scale =
      event.evt.deltaY > 0
        ? transformation.scale * distance
        : transformation.scale / -distance;

    transformValid({
      translate: {
        x: pos.x - transformed.x * scale,
        y: pos.y - transformed.y * scale,
      },
      scale: scale,
    });
  }

  const transform = (pos: { x: number; y: number }) => {
    return {
      x: (pos.x - transformation.translate.x) / transformation.scale,
      y: (pos.y - transformation.translate.y) / transformation.scale,
    };
  };

  const renderShape = (
    identifier: string,
    shape: Shape,
    color: string,
    selected?: boolean,
    onUpdate?: (shape: Shape) => void,
    onClick?: () => void
  ) => {
    const annotationTool = shape?.tool;
    if (annotationTool === undefined) return;

    const Component = shapeMap[annotationTool]?.component;
    if (!Component) return undefined;

    // properties passed to shape
    const shapeConfig = {
      stroke: alpha(color, 0.8),
      strokeWidth: (selected ? 4 : 2) / transformation.scale,
      fill: alpha(color, 0.3),
      onClick: onClick,
      listening: tool !== Tool.Edit,
    };

    // properties passed to editing points
    const editingPointConfig = {
      radius: 5 / transformation.scale,
    };

    return (
      <Component
        identifier={identifier}
        shape={shape}
        color={color}
        editing={tool === Tool.Edit}
        shapeConfig={shapeConfig}
        editingPointConfig={editingPointConfig}
        onRequestCursor={changeCursor}
        onUpdate={onUpdate}
        getTransformedPointerPosition={getTransformedPointerPosition}
      />
    );
  };

  const renderAnnotation = (annotation: Annotation) => {
    if (annotation.hidden || !annotation.shapes?.length) return;

    return annotation.shapes.map((shape, index) =>
      renderShape(
        `${annotation.id}.${index}`,
        shape,
        annotation.label?.color ?? "#f00",
        annotation.selected,
        (shape) => {
          dispatch(
            updateShape({
              annotation,
              shape,
              index,
            })
          );
        },
        () => toggleAnnotationSelection(annotation)
      )
    );
  };

  return (
    <Box
      position="relative"
      display="flex"
      overflow="hidden"
      flex="1 1"
      ref={container}
      onKeyDown={handleKeyDown}
    >
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
      <Stage
        style={{ cursor: defaultCursor(), position: "absolute" }}
        width={container.current?.clientWidth}
        height={container.current?.clientHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleMouseWheel}
        onContextMenu={(e) => e.evt.preventDefault()}
        ref={stage}
      >
        <Layer>
          {imageUri && (
            <BackgroundImage imageUri={imageUri} onResize={resize} />
          )}
          {activeShape &&
            renderShape(
              "__active__",
              activeShape,
              activeLabel?.color ?? annotationColor
            )}
          {annotations.map(renderAnnotation)}
        </Layer>
      </Stage>
    </Box>
  );
};

Canvas.defaultProps = defaultProps;

export default Canvas;
