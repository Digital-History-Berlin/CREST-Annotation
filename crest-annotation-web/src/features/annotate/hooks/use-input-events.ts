import { MutableRefObject, useCallback, useRef } from "react";
import Konva from "konva";
import { StageProps } from "react-konva";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Position } from "../../../types/geometry";
import { selectTransformation, updateTransformation } from "../slice/canvas";
import {
  GestureEvent,
  GestureEventHandler,
  GestureIdentifier,
  GestureOverload,
  Positions,
} from "../types/events";

interface GestureState {
  clickButtons: number;
  panStart?: Position;
  dragStart?: Positions;
  dragOverload?: GestureOverload;
}

// map mouse buttons flags to enum
const mapOverload = (flags: number, alternate?: boolean): GestureOverload => {
  switch (flags) {
    case 0x01:
      // alternate enforces secondary gesture with primary click
      // (can be used i.e. to use shift-key with touchpad)
      return alternate ? GestureOverload.Secondary : GestureOverload.Primary;
    case 0x02:
      return GestureOverload.Secondary;
    case 0x03:
    case 0x04:
      return GestureOverload.Tertiary;
    default:
      // other combinations are currently unsupported
      return GestureOverload.Other;
  }
};

// map single button to button flags
// (because mouse down events use different identifiers)
const mapButton = (button: number): number => {
  switch (button) {
    case 0:
      return 0x01;
    case 1:
      return 0x04;
    case 2:
      return 0x02;
    default:
      return 0x00;
  }
};

const identifierLog = (identifier: GestureIdentifier) => {
  if (identifier === GestureIdentifier.Move) return "move";
  if (identifier === GestureIdentifier.DragStart) return "drag-start";
  if (identifier === GestureIdentifier.DragMove) return "drag-move";
  if (identifier === GestureIdentifier.DragEnd) return "drag-end";
  if (identifier === GestureIdentifier.Click) return "click";
  return "unknown";
};

const eventLog = ({ identifier, overload }: GestureEvent) => {
  return `Gesture ${identifierLog(identifier)} (${overload})`;
};

/**
 * Provides event handlers for the stage component
 *
 * Collects input from mouse and tablet/touch and unifies them into
 * a simplified interface. Internally extract zoom/pan events and
 * applies the corresponding transformation.
 *
 * The gestures are forwarded over a callback.
 */
export const useInputEvents = ({
  handler,
  cursorRef,
  debug,
}: {
  handler: GestureEventHandler;
  cursorRef?: MutableRefObject<Position>;
  debug?: GestureIdentifier[];
}): StageProps => {
  const dispatch = useAppDispatch();
  // use global transformation
  const transformation = useAppSelector(selectTransformation);
  // state information for current gesture
  const state = useRef<GestureState>({ clickButtons: 0 });

  // forward the event to the provided callback
  const gesture = useCallback(
    (event: GestureEvent) => {
      // provide acccess to the latest cursor position
      if (cursorRef) cursorRef.current = event.absolute;
      // provide debug-trace to identify gestures
      if (debug?.includes(event.identifier)) console.debug(eventLog(event));
      // forward to the external handler
      handler(event);
    },
    [handler, cursorRef, debug]
  );

  // apply transformation to stage coordinates
  const transform = useCallback(
    ({ x, y }: Position) => ({
      x: (x - transformation.translate.x) / transformation.scale,
      y: (y - transformation.translate.y) / transformation.scale,
    }),
    [transformation]
  );

  const getPointerPositions = useCallback(
    (
      event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
    ): Positions | undefined => {
      const stage = event.target?.getStage();
      if (!stage) return;

      const absolute = stage.getPointerPosition();
      if (!absolute) return;

      return { transformed: transform(absolute), absolute };
    },
    [transform]
  );

  const handleMouseDown = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      if (!state.current.dragOverload) {
        // store start position (actual gesture is yet unclear)
        state.current.dragStart = getPointerPositions(event);
        state.current.panStart = transformation.translate;
      }

      // add button to current gesture
      state.current.clickButtons |= mapButton(event.evt.button);
    },
    [getPointerPositions, transformation]
  );

  const handleMouseMove = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      const positions = getPointerPositions(event);
      if (!positions) return;

      // move without buttons is handled separately
      if (!event.evt.buttons)
        gesture({
          identifier: GestureIdentifier.Move,
          overload: GestureOverload.Primary,
          transformation,
          ...positions,
        });

      const { panStart, dragStart, dragOverload } = state.current;
      // clear click buttons (this is not a click)
      state.current.clickButtons = 0;

      // pan gesture overrules others
      const overload = mapOverload(event.evt.buttons, event.evt.shiftKey);
      if (overload === GestureOverload.Secondary) {
        if (panStart && dragStart)
          dispatch(
            updateTransformation({
              ...transformation,
              translate: {
                x: panStart.x + positions.absolute.x - dragStart.absolute.x,
                y: panStart.y + positions.absolute.y - dragStart.absolute.y,
              },
            })
          );
        return;
      }

      // check if drag was started
      if (!dragOverload && dragStart) {
        gesture({
          identifier: GestureIdentifier.DragStart,
          overload,
          transformation,
          ...dragStart,
        });
        state.current.dragOverload = overload;
      }

      // trigger default drag move event
      if (dragOverload)
        gesture({
          identifier: GestureIdentifier.DragMove,
          overload: dragOverload,
          transformation,
          ...positions,
        });
    },
    [getPointerPositions, gesture, dispatch, transformation]
  );

  const handleMouseUp = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      const positions = getPointerPositions(event);
      if (!positions) return;

      // gesture was a drag
      if (state.current.dragOverload)
        gesture({
          identifier: GestureIdentifier.DragEnd,
          overload: state.current.dragOverload,
          transformation,
          ...positions,
        });
      // gesture was a click
      if (state.current.clickButtons)
        gesture({
          identifier: GestureIdentifier.Click,
          overload: mapOverload(state.current.clickButtons, event.evt.shiftKey),
          transformation,
          ...positions,
        });

      // update states
      state.current.dragStart = undefined;
      state.current.dragOverload = undefined;
      state.current.clickButtons = 0;
    },
    [getPointerPositions, gesture, transformation]
  );

  const handleTouchStart = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      if (event.evt.touches.length !== 1) return;
      const positions = getPointerPositions(event);
      if (!positions) return;

      // store start position (actual gesture is yet unclear)
      state.current.dragStart = getPointerPositions(event);
    },
    [getPointerPositions]
  );

  const handleTouchMove = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      if (event.evt.touches.length !== 1) return;
      const positions = getPointerPositions(event);
      if (!positions) return;

      gesture({
        identifier: GestureIdentifier.DragMove,
        overload: GestureOverload.Primary,
        transformation,
        ...positions,
      });
      // touch move is always classified as primary gesture
      state.current.dragOverload = GestureOverload.Primary;
    },
    [getPointerPositions, gesture, transformation]
  );

  const handleTouchEnd = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      if (event.evt.touches.length !== 1) return;
      const positions = getPointerPositions(event);
      if (!positions) return;

      // mouse was moved while buttons where down (drag ended)
      if (state.current.dragOverload)
        gesture({
          identifier: GestureIdentifier.DragEnd,
          overload: state.current.dragOverload,
          transformation,
          ...positions,
        });
      // mouse was not moved (gesture was a click)
      else
        gesture({
          identifier: GestureIdentifier.Click,
          overload: mapOverload(state.current.clickButtons),
          transformation,
          ...positions,
        });

      // update states
      state.current.dragOverload = undefined;
    },
    [getPointerPositions, gesture, transformation]
  );

  const handleWheel = useCallback(
    (event: Konva.KonvaEventObject<WheelEvent>) => {
      const positions = getPointerPositions(event);
      if (!positions) return;

      // avoid actual scroll
      event.evt.preventDefault();

      // TODO: maybe configure
      const distance = 1.05;
      const scale =
        event.evt.deltaY > 0
          ? transformation.scale * distance
          : transformation.scale / distance;

      dispatch(
        updateTransformation({
          translate: {
            // zoom into cursor position
            x: positions.absolute.x - positions.transformed.x * scale,
            y: positions.absolute.y - positions.transformed.y * scale,
          },
          scale: scale,
        })
      );
    },
    [getPointerPositions, dispatch, transformation]
  );

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onWheel: handleWheel,
  };
};
