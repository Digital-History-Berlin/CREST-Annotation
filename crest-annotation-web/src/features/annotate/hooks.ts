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
 */
export const useAnnotationTools = ({
  cursorRef,
  onRequestLabel,
  onCancelLabel,
}: {
  cursorRef: MutableRefObject<Position>;
  onRequestLabel: () => MaybePromise<Label>;
  onCancelLabel: () => void;
}) => {
  const dispatch = useAppDispatch();

  const tool = useAppSelector(selectActiveTool);
  const config = useAppSelector(selectActiveConfig);
  const modifiers = useAppSelector(selectActiveModifiers);
  const groupAnnotationId = useAppSelector(selectGroupAnnotationId);

  const labelRequestRef = useRef<string>();
  // shape that is currently being created
  const [activeShape, setActiveShape] = useState<Shape>();

  // create new annotation with given label and shape
  const labelAnnotation = useCallback(
    (shape: Shape, label: Label) => {
      console.info("Label selected");
      dispatch(
        addAnnotation({
          shapes: [shape],
          label: label,
          id: uuidv4(),
        })
      );

      console.info("Annotation completed");
      setActiveShape(undefined);
      onCancelLabel?.();
    },
    [onCancelLabel, dispatch]
  );

  // create new annotation from shape
  const createAnnotation = useCallback(
    (shape: Shape) => {
      // TODO: this should be checked in other places as well
      // TODO: generalized approach to discard outdated interaction
      if (labelRequestRef.current !== undefined) {
        console.warn("Label request not cancelled");
        // cancel ongoing request
        onCancelLabel?.();
      }

      // trace request to discard outdated promises
      const requestId = uuidv4();
      labelRequestRef.current = requestId;

      Promise.resolve(onRequestLabel())
        .then((label) => {
          if (labelRequestRef.current !== requestId) {
            console.warn("Discarding outdated label request");
            // discard outdated request
            return;
          }
          // assign the selected label to the created shape
          labelAnnotation(shape, label);
        })
        .catch((error) => {
          if (error) console.error(error);
          // if no error is given label request was discarded
          else console.info("Label request cancelled");
        });
    },
    [labelAnnotation, onRequestLabel, onCancelLabel]
  );

  // cancel the current annotation
  const cancelAnnotation = useCallback(() => {
    console.info("Annotation cancelled");
    setActiveShape(undefined);
    onCancelLabel?.();
  }, [onCancelLabel]);

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
      cancelAnnotation();
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
    () => cancelAnnotation(),
    // this should explicitly only trigger when the active tool changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool]
  );

  return {
    activeShape,
    labelAnnotation,
    createAnnotation,
    cancelAnnotation,
    handleClick,
    handleMove,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
