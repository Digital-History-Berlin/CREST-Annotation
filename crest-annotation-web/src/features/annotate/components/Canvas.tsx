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
import ShapeRenderer from "./tools/Shape";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Position } from "../../../types/Position";
import {
  AnnotatedShape,
  useAnnotationTools,
} from "../hooks/use-annotation-tools";
import { useInputEvents } from "../hooks/use-input-events";
import { Shape } from "../slice/annotations";
import { selectTransformation, updateTransformation } from "../slice/canvas";
import { Tool, selectActiveLabelId, selectActiveTool } from "../slice/tools";

export const cursorMap = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: "pointer",
  [Tool.Segment]: undefined,
};

interface LabelPopup {
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
}

interface LabelPromise {
  resolve: (label: Label) => void;
  reject: (reason: unknown) => void;
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
  const cursorRef = useRef<Position>({ x: 0, y: 0 });
  const labelRef = useRef<LabelPromise>();

  const tool = useAppSelector(selectActiveTool);
  const transformation = useAppSelector(selectTransformation);

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

  const labelPopupPlace = useCallback(() => {
    if (!stageRef.current) return;

    // calculate a nice position
    const { x, y } = cursorRef.current;
    return {
      left: x + 10,
      top: y <= stageRef.current.height() / 2 ? y : undefined,
      bottom:
        y > stageRef.current.height() / 2
          ? stageRef.current.height() - y
          : undefined,
    };
  }, []);

  const cancelLabel = useCallback((reason: unknown) => {
    // discard ongoing label selection
    labelRef.current?.reject(reason);
    // hide label popup
    setLabelPopup(undefined);
  }, []);

  const requestLabel = useCallback(
    (shape: Shape) =>
      // create a new promise that await the selection of a label
      new Promise<AnnotatedShape>((resolve, reject) => {
        if (activeLabel) return { shape, label: activeLabel };

        setLabelPopup(labelPopupPlace());
        labelRef.current = {
          resolve: (label: Label) => resolve({ shape, label }),
          reject,
        };
      }),
    [labelPopupPlace, activeLabel]
  );

  const { activeShape, gestureHandlers } = useAnnotationTools({
    requestLabel,
    cancelLabel,
    cursorRef,
  });

  const events = useInputEvents(gestureHandlers);

  // allow to complete an annotation by selecting a label in the sidebar
  // (in case the popup has already been opened)
  useEffect(() => {
    if (labelPopup && activeLabel) labelRef.current?.resolve(activeLabel);
    // this should explicitly only trigger when the active label changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLabel]);

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
  const defaultCursor = () => cursorMap[tool] || "crosshair";
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
          onSelect={(label: Label) => labelRef.current?.resolve(label)}
          onCancel={() => labelRef.current?.reject("Popup closed")}
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
      </Stage>
    </Box>
  );
};

Canvas.defaultProps = defaultProps;

export default Canvas;
