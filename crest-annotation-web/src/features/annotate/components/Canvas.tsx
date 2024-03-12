import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";
import Konva from "konva";
import { Layer } from "react-konva";
import AnnotationsLayer from "./AnnotationsLayer";
import BackgroundImage from "./BackgroundImage";
import InputStage from "./InputStage";
import LabelsPopup from "./LabelsPopup";
import ShapeRenderer from "./tools/Shape";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Position } from "../../../types/Position";
import { useAnnotationTools } from "../hooks";
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
  resolve: (label: Label) => void;
  reject: (reason: string) => void;

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
  const cursorRef = useRef<Position>({ x: 0, y: 0 });

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

  const cancelLabel = useCallback(
    (reason: string) => {
      // discard ongoing label selection
      labelPopup?.reject(reason);
      // hide label popup
      setLabelPopup(undefined);
    },
    [labelPopup]
  );

  const requestLabel = useCallback(
    () =>
      // create a new promise that await the selection of a label
      new Promise<Label>((resolve, reject) =>
        setLabelPopup({ resolve, reject, ...labelPopupPlace() })
      ),
    [labelPopupPlace]
  );

  const {
    activeShape,
    handleClick,
    handleMove,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useAnnotationTools({
    cursorRef,
    onCancelLabel: cancelLabel,
    onRequestLabel: requestLabel,
  });

  // allow to complete an annotation by selecting a label in the sidebar
  // (in case the popup has already been opened)
  useEffect(() => {
    if (labelPopup && activeLabel) labelPopup.resolve(activeLabel);
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
          onSelect={labelPopup?.resolve}
          onCancel={() => labelPopup?.reject("Popup closed")}
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
