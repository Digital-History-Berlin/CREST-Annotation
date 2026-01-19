import React, { useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Konva from "konva";
import { Stage } from "react-konva";
import AnnotationsLayer from "./AnnotationsLayer";
import BackgroundLayer from "./BackgroundLayer";
import PreviewLayer from "./PreviewLayer";
import { useAppSelector } from "../../../../app/hooks";
import { Position } from "../../../../types/geometry";
import { useCanvasGestures } from "../../hooks/use-canvas-gestures";
import { useInputEvents } from "../../hooks/use-input-events";
import { useResizeObserver } from "../../hooks/use-resize-observer";
import { useToolController } from "../../hooks/use-tool-controller";
import { useAnnotationProject } from "../../slice/annotations";
import { selectInitialized, selectTransformation } from "../../slice/canvas";
import { GestureIdentifier } from "../../types/events";
import LabelsPopup from "../LabelsPopup";

const Canvas = () => {
  const project = useAnnotationProject();

  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const cursorRef = useRef<Position>({ x: 0, y: 0 });
  const controller = useToolController({ stageRef, cursorRef });
  const size = useResizeObserver(boxRef);

  const events = useInputEvents({
    handler: controller.handleGesture,
    cursorRef,
    containerRef: boxRef,
    // enable debugging for some of the gestures
    debug: [
      GestureIdentifier.Click,
      GestureIdentifier.DragStart,
      GestureIdentifier.DragEnd,
    ],
  });

  // enhanced gestures for pan/zoom
  const { resize, bind } = useCanvasGestures({
    containerRef: boxRef,
    stageRef,
  });

  // update the canvas content
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => resize(), [size]);

  const transformation = useAppSelector(selectTransformation);
  const initialized = useAppSelector(selectInitialized);
  // update the zoom on change
  useEffect(() => {
    stageRef.current?.scale({
      x: transformation.scale,
      y: transformation.scale,
    });
    stageRef.current?.position(transformation.translate);
  }, [transformation, stageRef]);

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
      // apply pan/zoom gestures
      sx={{ touchAction: "none" }}
      {...bind()}
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

      {!initialized && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
        </div>
      )}

      <Stage
        ref={stageRef}
        // apply style to (inner) stage
        // stage should adapt to box size
        style={{ cursor: defaultCursor(), position: "absolute" }}
        width={size.width}
        height={size.height}
        // suppress default context menu
        onContextMenu={(e) => e.evt.preventDefault()}
        // handle events
        {...events}
      >
        {/* IMPORTANT: show the image so that initialization is done */}
        <BackgroundLayer onResize={resize} />
        {initialized && <AnnotationsLayer onRequestCursor={changeCursor} />}
        {initialized && <PreviewLayer transformation={transformation} />}
      </Stage>
    </Box>
  );
};

export default Canvas;
