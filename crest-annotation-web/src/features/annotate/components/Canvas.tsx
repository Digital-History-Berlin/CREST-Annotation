import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import Konva from "konva";
import { Layer } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import AnnotationsLayer from "./AnnotationsLayer";
import BackgroundImage from "./BackgroundImage";
import InputStage from "./InputStage";
import LabelsPopup from "./LabelsPopup";
import ShapeRenderer, { shapeMap } from "./tools/Shape";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { GestureEvent } from "../../../types/Events";
import { Position } from "../../../types/Position";
import { Shape, addAnnotation, addShape } from "../slice/annotations";
import { selectTransformation, updateTransformation } from "../slice/canvas";
import {
  Modifiers,
  Tool,
  selectActiveLabelId,
  selectActiveModifiers,
  selectActiveTool,
  selectGroupAnnotationId,
} from "../slice/tools";

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

  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const tool = useAppSelector(selectActiveTool);
  const activeLabelId = useAppSelector(selectActiveLabelId);
  const modifiers = useAppSelector(selectActiveModifiers);
  const transformation = useAppSelector(selectTransformation);

  const groupAnnotationId = useAppSelector(selectGroupAnnotationId);

  const [activeLabel, setActiveLabel] = useState<Label>();
  const [activeShape, setActiveShape] = useState<Shape>();
  const [labelPopup, setLabelPopup] = useState<PopupPosition>();
  const [cursor, setCursor] = useState<Position>({ x: 0, y: 0 });

  const { data: labels } = useGetProjectLabelsQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );

  // cache the active label
  useEffect(() => {
    setActiveLabel(
      activeLabelId
        ? labels?.find((label) => label.id === activeLabelId)
        : undefined
    );
  }, [activeLabelId, labels]);

  // allow to complete an annotation by selecting a label in the sidebar
  // (in case the popup has already been opened)
  useEffect(() => {
    if (labelPopup && activeLabel && activeShape)
      createAnnotation(activeLabel, activeShape);
    // this should explicitly only trigger when the active label changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLabel]);

  // cancel the annotation on tool change
  useEffect(
    () => cancelAnnotation(),
    // this should explicitly only trigger when the active tool changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool]
  );

  // update the zoom on change
  useEffect(() => {
    stageRef.current?.scale({
      x: transformation.scale,
      y: transformation.scale,
    });
    stageRef.current?.position(transformation.translate);
  }, [transformation, stageRef]);

  // handle image (size) change
  const resize = useCallback(
    (width: number, height: number) => {
      // reset the current transformation
      if (boxRef.current)
        dispatch(
          updateTransformation({
            translate: { x: 0, y: 0 },
            // fit image into container height
            scale: boxRef.current?.clientHeight / height,
          })
        );
    },
    [dispatch]
  );

  // gets the default cursor that is shown when hovering the canvas
  const defaultCursor = () =>
    tool.tool === Tool.Edit ? "pointer" : "crosshair";
  // change the current cursor
  const changeCursor = (cursor: string | undefined) => {
    const container = stageRef.current?.container();
    if (container !== undefined)
      container.style.cursor = cursor ?? defaultCursor();
  };

  // create new annotation with given label and shape
  const createAnnotation = (label: Label, shape: Shape) => {
    dispatch(
      addAnnotation({
        shapes: [shape],
        label: label,
        id: uuidv4(),
      })
    );

    console.log("Annotation created");
    setActiveShape(undefined);
    setLabelPopup(undefined);
  };

  const cancelAnnotation = () => {
    console.log("Annotation cancelled");
    setActiveShape(undefined);
    setLabelPopup(undefined);
  };

  const displayPopup = ({ x, y }: Position) => {
    if (!stageRef.current) return;

    // calculate a nice position
    const popupPos = {
      left: x + 10,
      top: y <= stageRef.current.height() / 2 ? y : undefined,
      bottom:
        y > stageRef.current.height() / 2
          ? stageRef.current.height() - y
          : undefined,
    };

    // ensure shape does not change anymore
    setLabelPopup(popupPos);
  };

  const updateActive = (shape: Shape): void => {
    if (!shape.finished) {
      // shape not yet finished, update active shape
      setActiveShape(shape);
      return;
    }

    if (modifiers.includes(Modifiers.Group) && groupAnnotationId) {
      setActiveShape(undefined);
      // group tool is active, add shape to existing annotation
      dispatch(addShape({ id: groupAnnotationId, shape }));
      return;
    }

    if (activeLabel) {
      // label is pre-selected, create annotation right away
      createAnnotation(activeLabel, shape);
      return;
    }

    // label is to be selected, display popup
    setActiveShape(shape);
    displayPopup(cursor);
  };

  const handleClick = async (event: GestureEvent) => {
    // popup is currently open, cancel annotation
    if (labelPopup) {
      cancelAnnotation();
      return;
    }

    const shape = await Promise.resolve(
      shapeMap[tool.tool]?.onGestureClick?.(
        activeShape,
        event,
        updateActive,
        tool.config
      )
    );

    if (shape) updateActive(shape);
  };

  const handleMove = async (event: GestureEvent) => {
    // track cursor position
    setCursor(event.absolute);

    const shape = await Promise.resolve(
      shapeMap[tool.tool]?.onGestureMove?.(
        activeShape,
        event,
        updateActive,
        tool.config
      )
    );

    if (shape) updateActive(shape);
  };

  const handleDragStart = async (event: GestureEvent) => {
    const shape = await Promise.resolve(
      shapeMap[tool.tool]?.onGestureDragStart?.(
        activeShape,
        event,
        updateActive,
        tool.config
      )
    );

    if (shape) updateActive(shape);
  };

  const handleDragMove = async (event: GestureEvent) => {
    // track cursor position
    setCursor(event.absolute);

    const shape = await Promise.resolve(
      shapeMap[tool.tool]?.onGestureDragMove?.(
        activeShape,
        event,
        updateActive,
        tool.config
      )
    );

    if (shape) updateActive(shape);
  };

  const handleDragEnd = async (event: GestureEvent) => {
    const shape = await Promise.resolve(
      shapeMap[tool.tool]?.onGestureDragEnd?.(
        activeShape,
        event,
        updateActive,
        tool.config
      )
    );

    if (shape) updateActive(shape);
  };

  return (
    <Box
      position="relative"
      display="flex"
      overflow="hidden"
      flex="1 1"
      ref={boxRef}
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
      <InputStage
        // apply style to (outer) box
        // box should fill available space
        sx={{
          position: "relative",
          display: "flex",
          overflow: "hidden",
          flex: "1 1",
        }}
        // apply style to (inner) stage
        // stage should adapt to box size
        style={{ cursor: defaultCursor(), position: "absolute" }}
        width={boxRef.current?.clientWidth}
        height={boxRef.current?.clientHeight}
        stageRef={stageRef}
        // handle events
        onGestureMove={handleMove}
        onGestureDragStart={handleDragStart}
        onGestureDragMove={handleDragMove}
        onGestureDragEnd={handleDragEnd}
        onGestureClick={handleClick}
        // render layer with injected properties
      >
        {imageUri && (
          <Layer>
            <BackgroundImage imageUri={imageUri} onResize={resize} />
          </Layer>
        )}
        <AnnotationsLayer onRequestCursor={changeCursor} />
        {activeShape && (
          <Layer>
            <ShapeRenderer
              identifier="__active__"
              shape={activeShape}
              color={activeLabel?.color ?? annotationColor}
              transformation={transformation}
            />
          </Layer>
        )}
      </InputStage>
    </Box>
  );
};

Canvas.defaultProps = defaultProps;

export default Canvas;
