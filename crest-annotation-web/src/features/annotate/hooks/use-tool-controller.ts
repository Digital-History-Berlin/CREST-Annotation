import { Key, useCallback, useMemo, useState } from "react";
import Konva from "konva";
import { Label } from "../../../api/openApi";
import { useAppDispatch } from "../../../app/hooks";
import { Position } from "../../../types/geometry";
import { processGesture, processKey, processLabel } from "../slice/toolbox";
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
  handleKey: (key: Key) => void;
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

  const [labelPopup, setLabelPopup] = useState<LabelPopup>();

  const toolApi: ToolApi = useMemo(() => {
    const requestLabel = () => {
      if (!stageRef.current || !cursorRef.current) return;

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
  }, [stageRef, cursorRef]);

  const handleGesture = useCallback(
    (gesture: GestureEvent) => {
      dispatch(processGesture({ gesture, toolApi }));
    },
    [dispatch, toolApi]
  );

  const handleLabel = useCallback(
    (label?: Label) => {
      dispatch(processLabel({ label, toolApi }));
    },
    [dispatch, toolApi]
  );

  const handleKey = useCallback(
    (key: Key) => {
      dispatch(processKey({ key, toolApi }));
    },
    [dispatch, toolApi]
  );

  return {
    labelPopup,
    handleGesture,
    handleLabel,
    handleKey,
  };
};
