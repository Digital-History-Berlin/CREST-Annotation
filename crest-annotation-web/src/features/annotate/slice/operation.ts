import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { createAppAsyncThunk } from "../../../types/thunks";
import { Operation, OperationRejectedError } from "../types/operation";

export interface OperationSlice {
  id: string | undefined;
  current: Operation | undefined;
}

const initialState: OperationSlice = {
  id: undefined,
  current: undefined,
};

const debug = (message: string, id: string, operation: Operation | undefined) =>
  operation &&
  !operation.silence &&
  console.debug(`${message}: ${id.substring(0, 6)}`);

/**
 * Operation slice
 *
 * The operation slice provides a simple approach to managing the lifecycle
 * of operations (i.e. the creation of a shape), where only one operation
 * can be active at a time. This helps to track if the result of a long-running
 * calculation should be applied to the state or discarded.
 *
 * Furthermore, every operation can store a cancellation and completion callback.
 * This decouples them from the operation logic itself, which allows for example
 * to properly cancel an operation when a new operation is started.
 *
 * However this implies that modifying the operation state can always have side
 * effects, which is why t can only be done from the provided async thunks.
 */
export const slice = createSlice({
  name: "operation",
  initialState,
  reducers: {
    updateOperation: (
      state,
      action: PayloadAction<{ id: string; operation: Operation } | undefined>
    ) => {
      state.id = action.payload?.id;
      state.current = action.payload?.operation;
    },
  },
});

export default slice.reducer;

export type OperationCancelPayload = {
  id: string | undefined;
};

export type OperationBeginPayload<O> = {
  operation: O;
};

export type OperationUpdatePayload<O> = {
  id: string | undefined;
  operation: O;
};

export type OperationCompletePayload = {
  id: string | undefined;
};

export type OperationChainPayload<O> = {
  id: string | undefined;
  operation: O;
};

/**
 * Cancel the specified operation
 *
 * This will trigger the cancellation of the current operation.
 * If an operation id is specified and it does not match the current operation,
 * an exception is thrown and the current operation is not cancelled.
 */
export const operationCancel = createAppAsyncThunk<
  void,
  OperationCancelPayload
>("operation/cancel", ({ id }, { dispatch, getState }) => {
  const { operation: current } = getState();

  if (
    current.id === undefined ||
    current.current === undefined ||
    (id && id !== current.id)
  )
    // swallow mismatches on cancellation
    return;

  debug("Cancel operation", current.id, current.current);
  // trigger cancellation within current context
  current.current.cancellation?.();
  dispatch(slice.actions.updateOperation(undefined));
});

/**
 * Begin a new operation
 *
 * Any ongoing operation is cancelled before the new operation is started.
 *
 * Returns the newly created operation inluding the operation id. This id
 * must be provided with subsequent updates and completions, in order to
 * identify this operation.
 */
export const operationBeginUnknown = createAppAsyncThunk<
  string,
  OperationBeginPayload<Operation>
>("operation/begin", async ({ operation }, { dispatch }) => {
  await dispatch(operationCancel({ id: undefined })).unwrap();

  const id = uuidv4();
  debug("Begin operation", id, operation);
  dispatch(slice.actions.updateOperation({ id, operation }));

  return id;
});

/**
 * Update the operation state
 *
 * The operation must provide a valid id, which is used to verify that
 * the operation is still the current operation. Otherwise, an exception
 * is thrown and the update is ignored.
 */
export const operationUpdateUnknown = createAppAsyncThunk<
  void,
  OperationUpdatePayload<Operation>
>("operation/update", ({ id, operation }, { dispatch, getState }) => {
  const { operation: current } = getState();
  if (id === undefined || id !== current.id)
    throw new OperationRejectedError(id);

  dispatch(slice.actions.updateOperation({ id, operation }));
});

/**
 * Complete the current operation
 *
 * The operation must provide a valid id, which is used to verify that
 * the operation is still the current operation. Otherwise, an exception
 * is thrown and the completion is ignored.
 *
 * The completion will trigger the completion routine and reset the
 * current operation state to undefined.
 */
export const operationComplete = createAppAsyncThunk<
  void,
  OperationCompletePayload
>("operation/complete", ({ id }, { dispatch, getState }) => {
  const { operation: current } = getState();
  if (id === undefined || id !== current.id || current.current === undefined)
    throw new OperationRejectedError(id);

  debug("Complete operation", id, current.current);
  // trigger completion within current context
  current.current.completion?.(current.current.state);
  dispatch(slice.actions.updateOperation(undefined));
});

/**
 * Complete the current operation and proceed with a successor
 *
 * The operation must provide a valid id, which is used to verify that
 * the operation is still the current operation. Otherwise, an exception
 * is thrown and the completion is ignored. When chaining operations,
 * it is possible to allow an empty predecessor by providing undefined.
 *
 * The completion will trigger the completion routine and begin
 * the successor operation. Returns the newly created operation inluding
 * the operation id.
 */
export const operationChainUnknown = createAppAsyncThunk<
  string,
  OperationChainPayload<Operation>
>("operation/chain", ({ id, operation }, { dispatch, getState }) => {
  const { operation: current } = getState();
  // predecessor can be empty if current operation is also empty
  if (id !== current.id) throw new OperationRejectedError(id);

  if (id !== undefined && current.current !== undefined) {
    debug("Complete operation", id, current.current);
    // trigger completion within current context
    current.current.completion?.(current.current.state);
  }

  id = uuidv4();
  debug("Proceeding with operation", id, operation);
  dispatch(slice.actions.updateOperation({ id, operation }));

  return id;
});

// generic versions to improve type-safety without too many constraints
export const operationBegin = <O extends Operation>(
  payload: OperationBeginPayload<O>
) => operationBeginUnknown(payload);

export const operationUpdate = <O extends Operation>(
  payload: OperationUpdatePayload<O>
) => operationUpdateUnknown(payload);

export const operationChain = <O extends Operation>(
  payload: OperationChainPayload<O>
) => operationChainUnknown(payload);
