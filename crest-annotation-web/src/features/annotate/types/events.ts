import { Position, Transformation } from "../../../types/geometry";

/**
 * Identifies a gesture
 *
 * This abstracts for example from the mouse button or number of touches
 * in a way that should be compatible with different input methods.
 */
export enum GestureIdentifier {
  Move,
  DragStart,
  DragMove,
  DragEnd,
  Click,
}

/**
 * Identifies the case for an overloaded gesture
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
  identifier: GestureIdentifier;
  overload: GestureOverload;
  // current transformation
  transformation: Transformation;
};

export type GestureEventHandler = (event: GestureEvent) => void;
