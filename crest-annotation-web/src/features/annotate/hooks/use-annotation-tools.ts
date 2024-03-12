import { MutableRefObject, useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChainedAction } from "./use-action-stream";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { GestureEvent, GestureEvents } from "../../../types/Events";
import { MaybePromise } from "../../../types/MaybePromise";
import { Position } from "../../../types/Position";
import { useLocalActionStream } from "../components/ActionStreamProvider";
import { shapeMap } from "../components/tools/Shape";
import { ShapeEventHandler } from "../components/tools/Types";
import { Shape, addAnnotation } from "../slice/annotations";
import { selectActiveConfig, selectActiveTool } from "../slice/tools";

export interface AnnotationTools {
  activeShape: Shape | undefined;
  gestureHandlers: GestureEvents;
}

export class AnnotationAction {
  shape: Shape | undefined;
  label: Label | undefined;
}

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
}): AnnotationTools => {
  const dispatch = useAppDispatch();

  // reference to ongoing annotation action
  const actionRef = useRef<ChainedAction<Shape | undefined>>();
  const labelRef = useRef<string>();
  const stream = useLocalActionStream();

  const tool = useAppSelector(selectActiveTool);
  const config = useAppSelector(selectActiveConfig);
  //const modifiers = useAppSelector(selectActiveModifiers);
  //const groupAnnotationId = useAppSelector(selectGroupAnnotationId);

  // shape that is currently being created
  const [activeShape, setActiveShape] = useState<Shape>();

  // label was selected properly
  const labelResolved = useCallback(
    (shape: Shape, label: Label) => {
      console.info("Label selected");
      dispatch(
        addAnnotation({
          shapes: [shape],
          label: label,
          id: uuidv4(),
        })
      );
    },
    [dispatch]
  );

  // create new annotation from shape
  const createAnnotation = useCallback(
    (shape: Shape | undefined) => {
      if (shape)
        labelRef.current = stream.invoke(onRequestLabel, {
          cancel: onCancelLabel,
          resolved: (label) => labelResolved(shape, label),
          finalized: () => setActiveShape(undefined),
        });
    },
    [onRequestLabel, onCancelLabel, labelResolved, stream]
  );

  /*
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
    [createAnnotation, dispatch, activeShape, modifiers, groupAnnotationId]
  );
  */

  const handleGestureResult = useCallback(
    async (
      shape: Shape | undefined,
      resolve: (shape: Shape | undefined) => void
    ) => {
      if (shape) {
        setActiveShape(shape);
        // request label for completed shape
        if (shape.finished) resolve(shape);
        // proceed with current shape
        else return shape;
      }
      // complete current action without annotation
      else resolve(undefined);
    },
    []
  );

  const chainGestureHandler = (
    handler: ShapeEventHandler | undefined,
    event: GestureEvent
  ) => {
    // ignore handlers that are not defined
    if (handler === undefined) return;

    // begin annotation action
    if (actionRef.current === undefined)
      actionRef.current = stream.begin(
        async (resolve) => {
          const result = await handler(undefined, event, config);
          return handleGestureResult(result, resolve);
        },
        {
          resolved: createAnnotation,
          finalized: () => (actionRef.current = undefined),
        }
      );
    // chain to ongoing action
    else
      actionRef.current.chain(async (shape, resolve) => {
        const result = await handler(shape, event, config);
        return handleGestureResult(result, resolve);
      });
  };

  const handleClick = async (event: GestureEvent) => {
    // cancel ongoing label request
    // (this overrides the default action)
    //if (labelRequestRef.current !== undefined) {
    //  onCancelLabel?.("User click");
    //  return;
    //}
    chainGestureHandler(shapeMap[tool]?.onGestureClick, event);
  };

  const handleMove = async (event: GestureEvent) => {
    chainGestureHandler(shapeMap[tool]?.onGestureMove, event);
    // track cursor position
    cursorRef.current = event.absolute;
  };

  const handleDragStart = async (event: GestureEvent) => {
    chainGestureHandler(shapeMap[tool]?.onGestureDragStart, event);
  };

  const handleDragMove = async (event: GestureEvent) => {
    chainGestureHandler(shapeMap[tool]?.onGestureDragMove, event);
    // track cursor position
    cursorRef.current = event.absolute;
  };

  const handleDragEnd = async (event: GestureEvent) => {
    chainGestureHandler(shapeMap[tool]?.onGestureDragEnd, event);
  };

  return {
    activeShape,
    gestureHandlers: {
      onGestureClick: handleClick,
      onGestureMove: handleMove,
      onGestureDragStart: handleDragStart,
      onGestureDragMove: handleDragMove,
      onGestureDragEnd: handleDragEnd,
    },
  };
};
