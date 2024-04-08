import React, { useCallback, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import Konva from "konva";
import { Stage } from "react-konva";
import AnnotationsLayer from "./AnnotationsLayer";
import BackgroundLayer from "./BackgroundLayer";
import PreviewLayer from "./PreviewLayer";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { Position } from "../../../../types/geometry";
import { useInputEvents } from "../../hooks/use-input-events";
import { useToolController } from "../../hooks/use-tool-controller";
import { useAnnotationProject } from "../../slice/annotations";
import { selectTransformation, updateTransformation } from "../../slice/canvas";
import { GestureIdentifier } from "../../types/events";
import LabelsPopup from "../LabelsPopup";

const Canvas = () => {
  const dispatch = useAppDispatch();
  const project = useAnnotationProject();

  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const cursorRef = useRef<Position>({ x: 0, y: 0 });
  const controller = useToolController({ stageRef, cursorRef });

  const events = useInputEvents({
    handler: controller.handleGesture,
    cursorRef,
    // enable debugging for some of the gestures
    debug: [
      GestureIdentifier.Click,
      GestureIdentifier.DragStart,
      GestureIdentifier.DragEnd,
    ],
  });

  const transformation = useAppSelector(selectTransformation);
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
  const defaultCursor = () => /*cursorMap[tool] || */ "crosshair";
  // change the current cursor
  const changeCursor = (cursor: string | undefined) => {
    const container = stageRef.current?.container();
    if (container !== undefined)
      container.style.cursor = cursor ?? defaultCursor();
  };

  return (
    <Box
      // apply style to (outer) box
      // box should fill available space
      position="relative"
      display="flex"
      overflow="hidden"
      flex="1 1"
      ref={boxRef}
    >
      <div
        style={{
          ...controller.labelPopup,
          display: controller.labelPopup ? "block" : "none",
          position: "absolute",
          backgroundColor: "white",
          zIndex: 1500,
        }}
      >
        <LabelsPopup
          projectId={project.id}
          onSelect={controller.handleLabel}
          onCancel={controller.handleLabel}
        />
      </div>

      <Stage
        ref={stageRef}
        // apply style to (inner) stage
        // stage should adapt to box size
        style={{ cursor: defaultCursor(), position: "absolute" }}
        width={boxRef.current?.clientWidth}
        height={boxRef.current?.clientHeight}
        // suppress default context menu
        onContextMenu={(e) => e.evt.preventDefault()}
        // handle events
        {...events}
      >
        <BackgroundLayer onResize={resize} />
        <AnnotationsLayer onRequestCursor={changeCursor} />
        <PreviewLayer transformation={transformation} />
      </Stage>
    </Box>
  );
};

export default Canvas;
