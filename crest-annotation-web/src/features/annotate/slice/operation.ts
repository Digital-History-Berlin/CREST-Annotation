import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { AppDispatch, RootState } from "../../../app/store";
import { ToolboxOperation } from "../toolbox";
import { Begin, OperationRejectedError } from "../types/operation";

/// Application specific operation type
export type RootOperation = ToolboxOperation;
/// Application operation discriminators
export type RootOperationType = RootOperation["type"];

export interface OperationSlice {
  current: RootOperation | undefined;
}

const initialState: OperationSlice = {
  current: undefined,
};

const debug = (message: string, operation: RootOperation | undefined) =>
  operation &&
  !operation.silence &&
  console.debug(`${message}: ${operation.id.substring(0, 6)}`);

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
      action: PayloadAction<RootOperation | undefined>
    ) => {
      state.current = action.payload;
    },
  },
});

export default slice.reducer;

/**
 * Cancel the current or specified operation
 *
 * This will trigger the cancellation of the current operation.
 * If an operation id is specified and it does not match the current operation,
 * an exception is thrown and the current operation is not cancelled.
 */
export const operationCancel = createAsyncThunk<
  void,
  { id: string } | void,
  { state: RootState; dispatch: AppDispatch }
>("operation/cancel", (payload, { dispatch, getState }) => {
  const {
    operation: { current },
  } = getState();

  if (current === undefined || (payload && payload.id !== current.id))
    // swallow mismatches on cancellation
    return;

  debug("Cancel operation", current);
  // trigger cancellation within current context
  current.cancellation?.();
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
export const operationBegin = createAsyncThunk<
  RootOperation,
  Begin<RootOperation>,
  { state: RootState; dispatch: AppDispatch }
>("operation/begin", async (payload, { dispatch }) => {
  await dispatch(operationCancel()).unwrap();

  const operation = { ...payload, id: uuidv4() } as RootOperation;
  debug("Begin operation", operation);
  dispatch(slice.actions.updateOperation(operation));

  return operation;
});

/**
 * Update the operation state
 *
 * The operation must provide a valid id, which is used to verify that
 * the operation is still the current operation. Otherwise, an exception
 * is thrown and the update is ignored.
 */
export const operationUpdate = createAsyncThunk<
  void,
  RootOperation | undefined,
  { state: RootState; dispatch: AppDispatch }
>("operation/update", (payload, { dispatch, getState }) => {
  const {
    operation: { current },
  } = getState();
  if (payload === undefined || payload.id !== current?.id)
    throw new OperationRejectedError(payload?.id);

  // avoid spamming console
  // debug("Update operation", operation);
  dispatch(slice.actions.updateOperation(payload));
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
export const operationComplete = createAsyncThunk<
  void,
  { id: string } | undefined,
  { state: RootState; dispatch: AppDispatch }
>("operation/complete", (payload, { dispatch, getState }) => {
  const {
    operation: { current },
  } = getState();
  if (payload === undefined || payload.id !== current?.id)
    throw new OperationRejectedError(payload?.id);

  debug("Complete operation", current);
  // trigger completion within current context
  current.completion?.(current.state);
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
export const operationChain = createAsyncThunk<
  RootOperation,
  {
    predecessor: { id: string } | undefined;
    successor: Begin<RootOperation>;
  },
  { state: RootState; dispatch: AppDispatch }
>("operation/chain", ({ predecessor, successor }, { dispatch, getState }) => {
  const {
    operation: { current },
  } = getState();
  // predecessor can be empty if current operation is also empty
  if (predecessor?.id !== current?.id)
    throw new OperationRejectedError(predecessor?.id);

  debug("Complete operation", current);
  // trigger completion within current context
  current?.completion?.(current.state);

  const operation = { ...successor, id: uuidv4() } as RootOperation;
  debug("Proceeding with operation", operation);
  dispatch(slice.actions.updateOperation(operation));

  return operation;
});

/// Throw an exception if the operation is not the current operation
export const throwIfRejected = (
  operation: RootOperation | undefined,
  { operation: { current } }: RootState
) => {
  if (operation === undefined || operation.id !== current?.id)
    throw new OperationRejectedError(operation?.id);
};

/// Check if the operation is of a specific type
export const isOperationOfType = <T extends RootOperation>(
  operation: RootOperation | undefined,
  type: T["type"]
): operation is T => {
  return operation !== undefined && operation.type === type;
};

export type AsyncOperationApi<T extends RootOperation> = {
  operation: T;
  // shorthands to dispatch operation actions
  update: (state: Omit<T, "id">) => Promise<void>;
  complete: () => Promise<void>;
  cancel: () => Promise<void>;
  chain: <O extends RootOperation>(successor: O) => Promise<O>;
};

export type AsyncOperationCallback<T extends RootOperation> = (
  api: AsyncOperationApi<T>
) => Promise<void>;

/**
 * Encapsulate a promise within an operation
 *
 * This provides a standard way to manage the lifecycle of an operation
 * when it matches an async function. It provides a simplified API to
 * update, complete, and cancel the operation.
 */
export const operationWithAsync = async <T extends RootOperation>(
  options: { dispatch: AppDispatch },
  operation: T,
  callback: AsyncOperationCallback<T>
) => {
  const update = (state: Omit<T, "id">) =>
    options
      .dispatch(operationUpdate({ id: operation.id, ...state } as T))
      .unwrap();
  const complete = () =>
    options.dispatch(operationComplete({ id: operation.id })).unwrap();
  const cancel = () =>
    options.dispatch(operationCancel({ id: operation.id })).unwrap();
  const chain = <O extends RootOperation>(successor: Begin<O>) =>
    options
      .dispatch(
        operationChain({
          predecessor: { id: operation.id },
          successor,
        })
      )
      .unwrap() as Promise<O>;

  await callback({
    operation,
    update,
    complete,
    cancel,
    chain,
  }).catch((error) => {
    // cancel operation on error
    options.dispatch(operationCancel(operation));
    // ensure error is still propagated
    throw error;
  });
};

/// Encapsulates a promise within a new operation
export const operationBeginWithAsync = <T extends RootOperation>(
  options: { dispatch: AppDispatch },
  initial: Begin<T>,
  callback: AsyncOperationCallback<T>
) =>
  options
    .dispatch(operationBegin(initial))
    .unwrap()
    .then((operation) => operationWithAsync(options, operation as T, callback));

/// Encapsulates a promise within an existing operation
export const operationUpdateWithAsync = <T extends RootOperation>(
  options: { dispatch: AppDispatch },
  operation: T,
  callback: AsyncOperationCallback<T>
) =>
  options
    .dispatch(operationUpdate(operation))
    .unwrap()
    .then(() => operationWithAsync(options, operation, callback));

/// Encapsulates a promise within an succeeding operation
export const operationChainWithAsync = <T extends RootOperation>(
  options: { dispatch: AppDispatch },
  predecessor: { id: string } | undefined,
  successor: Begin<T>,
  callback: AsyncOperationCallback<T>
) =>
  options
    .dispatch(operationChain({ predecessor, successor }))
    .unwrap()
    .then((operation) => operationWithAsync(options, operation as T, callback));
