import { useCallback, useEffect, useMemo, useState } from "react";
import Konva from "konva";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Position } from "../../../types/geometry";
import { useAnnotationProject } from "../slice/annotations";
import {
  processGesture,
  processKey,
  processLabel,
  selectToolboxLabelId,
} from "../slice/toolbox";
import { GestureEvent } from "../types/events";
import { ToolApi } from "../types/toolbox-thunks";

export interface LabelPopup {
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
}

export interface ToolController {
  labelPopup?: LabelPopup;
  /// Handle a gesture event
  handleGesture: (gesture: GestureEvent) => void;
  /// Handle a label selection
  handleLabel: (label?: Label) => void;
  /// Handle a keypress
  handleKey: (key: KeyboardEvent) => void;
}

/**
 * Provide tool logic
 *
 * The tool controller provides methods to handle gestures and labels.
 * It will delegate the events to the corresponding tool thunks.
 */
export const useToolController = ({
  stageRef,
  cursorRef,
}: {
  stageRef: React.RefObject<Konva.Stage>;
  cursorRef: React.RefObject<Position>;
}): ToolController => {
  const dispatch = useAppDispatch();
  const project = useAnnotationProject();

  // popup location
  const [labelPopup, setLabelPopup] = useState<LabelPopup>();

  // currently selected label
  const { data: labels } = useGetProjectLabelsQuery({ projectId: project.id });
  const selectedLabelId = useAppSelector(selectToolboxLabelId);
  const label = useMemo(
    () => labels?.find((label) => label.id === selectedLabelId),
    [labels, selectedLabelId]
  );

  const handleLabel = useCallback(
    (label?: Label) => {
      dispatch(processLabel({ label }));
    },
    [dispatch]
  );

  const toolApi: ToolApi = useMemo(() => {
    const requestLabel = () => {
      if (!stageRef.current || !cursorRef.current) return;
      // label is already pre-selected
      if (label)
        return dispatch(processLabel({ label })).unwrap().catch(console.log);

      console.debug("Request label");
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
    };

    const cancelLabel = () => {
      console.debug("Cancel label request");
      // close popup
      setLabelPopup(undefined);
    };

    return {
      requestLabel,
      cancelLabel,
    };
  }, [dispatch, stageRef, cursorRef, label]);

  const handleGesture = useCallback(
    (gesture: GestureEvent) => {
      dispatch(processGesture({ gesture, toolApi }));
    },
    [dispatch, toolApi]
  );

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      dispatch(processKey({ event, toolApi }));
    },
    [dispatch, toolApi]
  );

  // attach key event handler
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // label selected from elsewhere
  useEffect(() => {
    if (label) dispatch(processLabel({ label })).unwrap().catch(console.log);
  }, [dispatch, label]);

  return {
    labelPopup,
    handleGesture,
    handleLabel,
    handleKey,
  };
};
