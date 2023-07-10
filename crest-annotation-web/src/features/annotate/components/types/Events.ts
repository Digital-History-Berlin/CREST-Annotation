import { Position } from "./Position";
import { Transformation } from "../../slice/canvas";

/**
 * Identifies the case for an overloaded gesture
 *
 * This abstracts for example from the mouse button or number of touches
 * in a way that should be compatible with different input methods.
 *
 * Since the Wacom pen only has two buttons, pressing both buttons maps
 * to the tertiary action. This will correspond to the middle mouse button
 * (or using both mouse buttons on a standard mouse as well).
 */
export enum GestureOverload {
  // primary gesture action
  // (like left mouse button)
  Primary = 1,
  // secondary gesture action
  // (like right mouse button)
  Secondary = 2,
  // tertiary gesture action
  // (like mouse wheel button or primary and secondary together)
  Tertiary = 3,
  // unspecified button
  Other = 99,
}

// TODO: probably move to slice
export enum Shortcuts {
  CompleteShape,
}

export interface Positions {
  // transformed position
  transformed: Position;
  // stage client position
  absolute: Position;
}

/// Gesture event with overloading
export type GestureEvent = Positions & {
  overload: GestureOverload;
  // current transformation
  transformation: Transformation;
};

/// Interface containing common gestures
export interface GestureEvents {
  // indicates movement without buttons
  onGestureMove: (event: GestureEvent) => void;
  // indicates movement with buttons
  onGestureDragStart: (event: GestureEvent) => void;
  onGestureDragMove: (event: GestureEvent) => void;
  onGestureDragEnd: (event: GestureEvent) => void;
  // indicates single button event without movement
  onGestureClick: (event: GestureEvent) => void;
}
