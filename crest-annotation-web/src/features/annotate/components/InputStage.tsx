import React, { RefObject, useState } from "react";
import Konva from "konva";
import { Stage, StageProps } from "react-konva";
import { GestureEvents, GestureOverload, Positions } from "./types/Events";
import { Position } from "./types/Position";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectTransformation, updateTransformation } from "../slice/canvas";

type IProps = { stageRef: RefObject<Konva.Stage> } & GestureEvents & StageProps;

/**
 * Input wrapper for the standard Konva stage
 *
 * Collects input from mouse and tablet/touch and unifies them into
 * a simplified interface. Internally extract zoom/pan events and
 * applies the corresponding transformation.
 *
 * Currently uses global transformation by default.
 */
const InputStage = ({
  stageRef,
  children,
  onGestureMove,
  onGestureDragStart,
  onGestureDragMove,
  onGestureDragEnd,
  onGestureClick,
  ...props
}: IProps) => {
  const dispatch = useAppDispatch();

  // use global transformation
  const transformation = useAppSelector(selectTransformation);

  // state information for current gesture
  const [dragStart, setDragStart] = useState<Positions>();
  const [dragOverload, setDragOverload] = useState<GestureOverload>();
  const [clickButtons, setClickButtons] = useState(0);
  // state during pan gesture
  const [panStart, setPanStart] = useState<Position>();

  // map mouse buttons flags to enum
  const mapOverload = (flags: number): GestureOverload => {
    switch (flags) {
      case 0x01:
        return GestureOverload.Primary;
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

  // apply transformation to stage coordinates
  const transform = ({ x, y }: Position) => {
    return {
      x: (x - transformation.translate.x) / transformation.scale,
      y: (y - transformation.translate.y) / transformation.scale,
    };
  };

  const getPointerPositions = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ): Positions | undefined => {
    const stage = event.target?.getStage();
    if (!stage) return;

    const absolute = stage.getPointerPosition();
    if (!absolute) return;

    return { transformed: transform(absolute), absolute };
  };

  const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (!dragOverload) {
      // store start position (actual gesture is yet unclear)
      setDragStart(getPointerPositions(event));
      setPanStart(transformation.translate);
    }

    // add button to current gesture
    setClickButtons(clickButtons | mapButton(event.evt.button));
  };

  const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const positions = getPointerPositions(event);
    if (!positions) return;

    // move without buttons is handled separately
    if (!event.evt.buttons)
      onGestureMove({
        overload: GestureOverload.Primary,
        transformation,
        ...positions,
      });

    // clear click buttons (this is not a click)
    setClickButtons(0);

    // pan gesture overrules others
    const overload = mapOverload(event.evt.buttons);
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
      onGestureDragStart({ overload, transformation, ...dragStart });
      setDragOverload(overload);
    }

    // trigger default drag move event
    if (dragOverload)
      onGestureDragMove({
        overload: dragOverload,
        transformation,
        ...positions,
      });
  };

  const handleMouseUp = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const positions = getPointerPositions(event);
    if (!positions) return;

    // gesture was a drag
    if (dragOverload)
      onGestureDragEnd({
        overload: dragOverload,
        transformation,
        ...positions,
      });
    // gesture was a click
    if (clickButtons)
      onGestureClick({
        overload: mapOverload(clickButtons),
        transformation,
        ...positions,
      });

    // update states
    setDragStart(undefined);
    setDragOverload(undefined);
    setClickButtons(0);
  };

  const handleTouchStart = (event: Konva.KonvaEventObject<TouchEvent>) => {
    if (event.evt.touches.length !== 1) return;
    const positions = getPointerPositions(event);
    if (!positions) return;

    // store start position (actual gesture is yet unclear)
    setDragStart(getPointerPositions(event));
  };

  const handleTouchMove = (event: Konva.KonvaEventObject<TouchEvent>) => {
    if (event.evt.touches.length !== 1) return;
    const positions = getPointerPositions(event);
    if (!positions) return;

    onGestureDragMove({
      overload: GestureOverload.Primary,
      transformation,
      ...positions,
    });
    // touch move is always classified as primary gesture
    setDragOverload(GestureOverload.Primary);
  };

  const handleTouchEnd = (event: Konva.KonvaEventObject<TouchEvent>) => {
    if (event.evt.touches.length !== 1) return;
    const positions = getPointerPositions(event);
    if (!positions) return;

    // mouse was moved while buttons where down (drag ended)
    if (dragOverload)
      onGestureDragEnd({
        overload: dragOverload,
        transformation,
        ...positions,
      });
    // mouse was not moved (gesture was a click)
    else
      onGestureClick({
        overload: mapOverload(clickButtons),
        transformation,
        ...positions,
      });

    // update states
    setDragOverload(undefined);
  };

  const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
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
  };

  return (
    <Stage
      {...props}
      ref={stageRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onContextMenu={(e) => e.evt.preventDefault()}
    >
      {children}
    </Stage>
  );
};

export default InputStage;
