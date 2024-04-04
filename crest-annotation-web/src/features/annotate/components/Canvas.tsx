import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";
import Konva from "konva";
import { Layer, Stage } from "react-konva";
import AnnotationsLayer from "./AnnotationsLayer";
import BackgroundImage from "./BackgroundImage";
import LabelsPopup from "./LabelsPopup";
import PreviewLayer from "./PreviewLayer";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Position } from "../../../types/geometry";
import { useInputEvents } from "../hooks/use-input-events";
import {
  Operation,
  OperationController,
} from "../hooks/use-operation-controller";
import { useToolController } from "../hooks/use-tool-controller";
import { selectTransformation, updateTransformation } from "../slice/canvas";
import { selectActiveLabelId } from "../slice/tools";
import { GestureIdentifier } from "../types/events";

interface LabelPopup {
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
}

interface IProps {
  projectId?: string;
  imageUri?: string;
  annotationColor: string;
  operations: OperationController<Operation>;
}

const defaultProps = { annotationColor: "#D00000" };

const Canvas = ({
  projectId,
  imageUri,
  annotationColor,
  operations,
}: IProps) => {
  const dispatch = useAppDispatch();

  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const cursorRef = useRef<Position>({ x: 0, y: 0 });

  const { data: labels } = useGetProjectLabelsQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );

  const [labelPopup, setLabelPopup] = useState<LabelPopup>();
  const activeLabelId = useAppSelector(selectActiveLabelId);
  const activeLabel = useMemo(
    () =>
      activeLabelId
        ? labels?.find((label) => label.id === activeLabelId)
        : undefined,
    [activeLabelId, labels]
  );

  const requestLabel = useCallback(() => {
    if (!stageRef.current) return;

    // display popup with nice position
    const { x, y } = cursorRef.current;
    setLabelPopup({
      left: x + 10,
      top: y <= stageRef.current.height() / 2 ? y : undefined,
      bottom:
        y > stageRef.current.height() / 2
          ? stageRef.current.height() - y
          : undefined,
    });
  }, []);

  const cancelLabel = useCallback(() => {
    // close popup
    setLabelPopup(undefined);
  }, []);

  const controller = useToolController({
    controller: operations,
    requestLabel,
    cancelLabel,
  });

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
          ...labelPopup,
          display: labelPopup ? "block" : "none",
          position: "absolute",
          backgroundColor: "white",
          zIndex: 1500,
        }}
      >
        <LabelsPopup
          projectId={projectId}
          onSelect={controller.handleLabel}
          onCancel={cancelLabel}
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
        {imageUri && (
          <Layer>
            <BackgroundImage imageUri={imageUri} onResize={resize} />
          </Layer>
        )}
        <AnnotationsLayer onRequestCursor={changeCursor} />
        <PreviewLayer
          operation={controller.state}
          transformation={transformation}
        />
      </Stage>
    </Box>
  );
};

Canvas.defaultProps = defaultProps;

export default Canvas;
