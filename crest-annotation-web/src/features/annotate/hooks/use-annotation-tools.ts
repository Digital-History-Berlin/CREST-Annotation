import {
  MutableRefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { ActionSequence, swallowCancelation } from "./use-action-stream";
import { Label } from "../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { GestureEvent, GestureEvents } from "../../../types/Events";
import { MaybePromise } from "../../../types/MaybePromise";
import { Position } from "../../../types/Position";
import { useLocalActionStream } from "../components/ActionStreamProvider";
import { shapeMap } from "../components/tools/Shape";
import { ShapeEventHandler } from "../components/tools/Types";
import { Shape, addAnnotation, addShape } from "../slice/annotations";
import {
  Modifiers,
  selectActiveConfig,
  selectActiveModifiers,
  selectActiveTool,
  selectGroupAnnotationId,
} from "../slice/tools";

export interface AnnotationTools {
  activeShape: Shape | undefined;
  gestureHandlers: GestureEvents;
}

export interface AnnotatedShape {
  shape: Shape;
  label: Label;
}

/**
 * Encapsulates the UI agnostic part of the annotation process.
 *
 * Each shape creation is represented by one sequence operation,
 * which is executed on the action stream. Upon completion, the
 * label action is executed, which will then result in the
 * creation of an annotation.
 *
 * NOTE: This layer is not fully separated from the canvas.
 * It provides some functionality, which is specifically tailored
 * for this component. This allows passing down the gesture
 * handlers directly.
 *
 * TODO: Because the callbacks are captured for a long time, they
 * must be handled with care. Find a mechanism to avoid this.
 */
export const useAnnotationTools = ({
  requestLabel,
  cancelLabel,
  cursorRef,
}: {
  requestLabel: (shape: Shape) => MaybePromise<AnnotatedShape>;
  cancelLabel: (reason: unknown) => void;
  cursorRef: MutableRefObject<Position>;
}): AnnotationTools => {
  const dispatch = useAppDispatch();

  // reference to ongoing annotation action
  const labelRef = useRef<boolean>(false);
  const shapeRef = useRef<ActionSequence<Shape | undefined>>();
  const stream = useLocalActionStream();
  // shape that is currently being created
  const [activeShape, setActiveShape] = useState<Shape>();

  const tool = useAppSelector(selectActiveTool);
  const config = useAppSelector(selectActiveConfig);
  const modifiers = useAppSelector(selectActiveModifiers);
  const groupAnnotationId = useAppSelector(selectGroupAnnotationId);

  const createAnnotation = useCallback(
    ({ shape, label }: AnnotatedShape) => {
      console.info("Create annotation");

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

  const groupAnnotation = useCallback(
    (shape: Shape, id: string) => {
      console.info("Group annotation");

      dispatch(
        addShape({
          id,
          shape,
        })
      );
    },
    [dispatch]
  );

  const finalizeShape = useCallback(() => {
    // reset preview
    shapeRef.current = undefined;
    setActiveShape(undefined);
  }, []);

  const resolveShape = useCallback(
    (shape: Shape | undefined): void => {
      if (shape === undefined) return;

      // group tool is active, add shape to existing annotation
      if (modifiers.includes(Modifiers.Group) && groupAnnotationId)
        groupAnnotation(shape, groupAnnotationId);
      // shape finished, request label for active shape
      else {
        labelRef.current = true;
        stream
          .push(
            () => requestLabel(shape),
            (reason) => cancelLabel(reason),
            "request label"
          )
          .then(createAnnotation)
          .catch(console.log)
          .finally(() => {
            console.info("Label finalized");
            labelRef.current = false;
          });
      }
    },
    [
      createAnnotation,
      groupAnnotation,
      modifiers,
      groupAnnotationId,
      stream,
      // TODO: capturing these is dangerous
      cancelLabel,
      requestLabel,
    ]
  );

  const invokeGestureHandler = useCallback(
    (handler: ShapeEventHandler | undefined, event: GestureEvent) => {
      // ignore handlers that are not defined
      if (handler === undefined) return;
      // ignore handlers during annotation process

      // action sequence not yet initialized
      if (shapeRef.current === undefined) {
        shapeRef.current = new ActionSequence<Shape | undefined>(
          ["proceed", undefined],
          tool.toLowerCase(),
          // update preview whenever shape changes
          setActiveShape
        );

        stream
          .begin(shapeRef.current)
          .then(resolveShape)
          .finally(finalizeShape)
          .catch(swallowCancelation(console.log));
      }

      // excetute shape gesture
      shapeRef.current.append(async (shape) => handler(shape, event, config));
    },

    // IMPORTANT: The strategy on how to resolve a shape is captured upon
    // the start of the new sequence action. Therefore changes will not be reflected,
    // until the sequence is restarted.
    [resolveShape, finalizeShape, stream, config, tool]
  );

  const handleClick = useCallback(
    async (event: GestureEvent) => {
      // click discards label selection
      if (labelRef.current) {
        cancelLabel("User click");
        return;
      }

      invokeGestureHandler(shapeMap[tool]?.onGestureClick, event);
    },
    [invokeGestureHandler, tool, cancelLabel]
  );

  const handleMove = useCallback(
    async (event: GestureEvent) => {
      // discard gesture while selecting label
      if (labelRef.current) return;

      invokeGestureHandler(shapeMap[tool]?.onGestureMove, event);
      // update cursor position
      cursorRef.current = event.transformed;
    },
    [invokeGestureHandler, tool, cursorRef]
  );

  const handleDragStart = useCallback(
    async (event: GestureEvent) => {
      // discard gesture while selecting label
      if (labelRef.current) return;

      invokeGestureHandler(shapeMap[tool]?.onGestureDragStart, event);
    },
    [invokeGestureHandler, tool]
  );

  const handleDragMove = useCallback(
    async (event: GestureEvent) => {
      // discard gesture while selecting label
      if (labelRef.current) return;

      invokeGestureHandler(shapeMap[tool]?.onGestureDragMove, event);
      // update cursor position
      cursorRef.current = event.transformed;
    },
    [invokeGestureHandler, tool, cursorRef]
  );

  const handleDragEnd = useCallback(
    async (event: GestureEvent) => {
      // discard gesture while selecting label
      if (labelRef.current) return;

      invokeGestureHandler(shapeMap[tool]?.onGestureDragEnd, event);
    },
    [invokeGestureHandler, tool]
  );

  const gestureHandlers = useMemo(
    () => ({
      onGestureClick: handleClick,
      onGestureMove: handleMove,
      onGestureDragStart: handleDragStart,
      onGestureDragMove: handleDragMove,
      onGestureDragEnd: handleDragEnd,
    }),
    [handleClick, handleMove, handleDragStart, handleDragMove, handleDragEnd]
  );

  return { activeShape, gestureHandlers };
};
