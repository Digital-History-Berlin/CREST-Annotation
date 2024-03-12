import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { shapeMap } from "./components/tools/Shape";
import { Shape, addAnnotation, addShape } from "./slice/annotations";
import {
  Modifiers,
  selectActiveConfig,
  selectActiveModifiers,
  selectActiveTool,
  selectGroupAnnotationId,
} from "./slice/tools";
import { Label } from "../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { GestureEvent } from "../../types/Events";
import { MaybePromise } from "../../types/MaybePromise";
import { Position } from "../../types/Position";

/**
 * Encapsulates the UI agnostic part of the annotation process.
 *
 * The canvas (which provides the UI) can then use this logic.
 * This part is also responsible for keeping the user actions in sync
 * (especially when executing async actions whithout waiting in between).
 *
 * Since the logic can be a bit more complex, the hook provides a lot
 * of debug information to figure out what is going on in detail.
 */
export const useAnnotationTools = ({
  cursorRef,
  onRequestLabel,
  onCancelLabel,
}: {
  cursorRef: MutableRefObject<Position>;
  onRequestLabel: () => MaybePromise<Label>;
  onCancelLabel: (reason: string) => void;
}) => {
  const dispatch = useAppDispatch();

  const tool = useAppSelector(selectActiveTool);
  const config = useAppSelector(selectActiveConfig);
  const modifiers = useAppSelector(selectActiveModifiers);
  const groupAnnotationId = useAppSelector(selectGroupAnnotationId);

  // identifies an ongoing label request
  const labelRequestRef = useRef<string>();
  // shape that is currently being created
  const [activeShape, setActiveShape] = useState<Shape>();

  const requestLabel = useCallback(async (shape: Shape, requestId: string) => {
    try {
      await Promise.resolve(onRequestLabel);
      if (labelRequestRef.current !== requestId) {
        console.warn(
          `Discarding outdated label request (${requestId}/${labelRequestRef.current})`
        );
        // discard outdated request
        return;
      }

      console.info("Label selected");
      dispatch(
        addAnnotation({
          shapes: [shape],
          label: label,
          id: uuidv4(),
        })
      );
    } catch (error) {
      if (typeof error === "string")
        console.info(
          `Label request cancelled (${requestId}/${labelRequestRef.current}): ${error}`
        );
      // unexpected exception occured
      else console.error(error);
    } finally {
      console.info(
        `Label request finalized (${requestId}/${labelRequestRef.current})`
      );
      if (labelRequestRef.current === requestId) {
        // reset the active shape
        setActiveShape(undefined);
        // reset the label request
        labelRequestRef.current = undefined;
      }
    }
  }, []);

  // create new annotation from shape
  // this is the main logic, which includes an asynchronous call to request the label
  // TODO: generalized approach to discard outdated interaction
  const createAnnotation = useCallback(
    (shape: Shape) => {
      // TODO: this should be checked in other places as well
      if (labelRequestRef.current !== undefined) {
        console.warn(
          `Previous label request not cancelled (${labelRequestRef.current})`
        );
        // cancel ongoing request
        onCancelLabel?.("New label request");
      }

      // trace request to discard outdated promises
      const requestId = uuidv4();
      labelRequestRef.current = requestId;
      console.info(`Requesting label (${labelRequestRef.current})`);

      Promise.resolve(onRequestLabel())
        .then((label) => {})
        .catch((error) => {})
        .finally(() => {});
    },
    [onRequestLabel, onCancelLabel, dispatch]
  );

  const updateActive = useCallback(
    (shape: Shape): void => {
      // shape not yet finished, update active shape
      if (!shape.finished) {
        setActiveShape(shape);
      }
      // group tool is active, add shape to existing annotation
      else if (modifiers.includes(Modifiers.Group) && groupAnnotationId) {
        setActiveShape(undefined);
        dispatch(addShape({ id: groupAnnotationId, shape }));
      }
      // shape finished, request label for active shape
      else {
        setActiveShape(shape);
        createAnnotation(shape);
      }
    },
    [createAnnotation, dispatch, modifiers, groupAnnotationId]
  );

  const handleClick = async (event: GestureEvent) => {
    // cancel ongoing label request
    if (labelRequestRef.current !== undefined) {
      onCancelLabel?.("User click");
      return;
    }

    const shape = await Promise.resolve(
      shapeMap[tool]?.onGestureClick?.(activeShape, event, updateActive, config)
    );

    if (shape) updateActive(shape);
  };

  const handleMove = async (event: GestureEvent) => {
    // track cursor position
    cursorRef.current = event.absolute;

    const shape = await Promise.resolve(
      shapeMap[tool]?.onGestureMove?.(activeShape, event, updateActive, config)
    );

    if (shape) updateActive(shape);
  };

  const handleDragStart = async (event: GestureEvent) => {
    const shape = await Promise.resolve(
      shapeMap[tool]?.onGestureDragStart?.(
        activeShape,
        event,
        updateActive,
        config
      )
    );

    if (shape) updateActive(shape);
  };

  const handleDragMove = async (event: GestureEvent) => {
    // track cursor position
    cursorRef.current = event.absolute;

    const shape = await Promise.resolve(
      shapeMap[tool]?.onGestureDragMove?.(
        activeShape,
        event,
        updateActive,
        config
      )
    );

    if (shape) updateActive(shape);
  };

  const handleDragEnd = async (event: GestureEvent) => {
    const shape = await Promise.resolve(
      shapeMap[tool]?.onGestureDragEnd?.(
        activeShape,
        event,
        updateActive,
        config
      )
    );

    if (shape) updateActive(shape);
  };

  // cancel the annotation on tool change
  useEffect(
    () => {
      if (labelRequestRef.current !== undefined) {
        console.info(
          `Tool changed during label request ${labelRequestRef.current}`
        );
        onCancelLabel?.("Tool change");
      } else if (activeShape !== undefined) {
        console.info("Tool changed during usage");
        setActiveShape(undefined);
      }
    },
    // this should explicitly only trigger when the active tool changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool]
  );

  return {
    activeShape,
    handleClick,
    handleMove,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
