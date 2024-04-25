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

const debug = (message: string, operation: RootOperation) =>
  !operation.silence &&
  console.debug(`${message}: ${operation.id.substring(0, 6)}`);

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

export const operationCancel = createAsyncThunk<
  void,
  { id: string } | void,
  { state: RootState; dispatch: AppDispatch }
>("operation/cancel", (payload, { dispatch, getState }) => {
  const {
    operation: { current },
  } = getState();

  if (current === undefined || (payload && payload.id !== current.id)) return;
  // trigger cancellation within current context
  current.cancellation?.();

  debug("Cancel operation", current);
  dispatch(slice.actions.updateOperation(undefined));
});

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
  // trigger finalization within current context
  current.finalization?.();
  dispatch(slice.actions.updateOperation(undefined));
});

export const isOperationOfType = <T extends RootOperation>(
  operation: RootOperation | undefined,
  type: T["type"]
): operation is T => {
  return operation !== undefined && operation.type === type;
};

export type AsyncOperationApi<T> = {
  operation: T;
  update: (state: Omit<T, "id">) => void;
  complete: () => void;
  cancel: () => void;
};

export type AsyncOperationCallback<T> = (
  api: AsyncOperationApi<T>
) => Promise<void>;

/**
 * Encapsulate a promise within a single operation
 *
 * This provides a standard way to manage the lifecycle of an operation
 * when it matches an async function. It provides a simplified API to
 * update, complete, and cancel the operation.
 */
export const operationWithAsync = <T extends RootOperation>(
  options: { dispatch: AppDispatch },
  initial: Begin<T>,
  callback: AsyncOperationCallback<T>
) =>
  options
    .dispatch(operationBegin(initial))
    .unwrap()
    .then(async (operation) => {
      const update = (state: Omit<T, "id">) =>
        options.dispatch(operationUpdate({ id: operation.id, ...state } as T));
      const complete = () =>
        options.dispatch(operationComplete({ id: operation.id }));
      const cancel = () =>
        options.dispatch(operationCancel({ id: operation.id }));

      await callback({
        operation: operation as T,
        update,
        complete,
        cancel,
      }).catch((error) => {
        // cancel operation on error
        options.dispatch(operationCancel(operation));
        // ensure error is still propagated
        throw error;
      });
    });
