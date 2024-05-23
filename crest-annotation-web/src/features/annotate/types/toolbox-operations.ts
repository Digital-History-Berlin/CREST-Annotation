import { Operation } from "./operation";
import { Shape } from "./shapes";
import { Tool } from "./toolbox";

export type ToolOperationState = {
  tool: Tool;
};

/// Tool operation prototype
export type ToolOperation<
  T extends string = string,
  S extends ToolOperationState = ToolOperationState
> = Operation<T, S>;

export type AtomicToolOperationState<S extends Shape = Shape> = {
  tool: Tool;
  shape: S;
  labeling?: boolean;
};

/// Atomic (single shape) tool operation prototype
export type AtomicToolOperation<
  T extends string = string,
  S extends AtomicToolOperationState = AtomicToolOperationState
> = Operation<T, S>;

export type InitializationOperationState = {
  tool: Tool;
};

/// Initialization operation
export type InitializationOperation = Operation<
  "toolbox/initialization",
  InitializationOperationState
>;
