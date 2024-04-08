import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { AppDispatch, RootState } from "../../../app/store";
import { ToolboxOperation } from "../toolbox";
import { OperationRejectedError } from "../types/operation";

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
  void,
  { state: RootState; dispatch: AppDispatch }
>("operation/cancel", (_, { dispatch, getState }) => {
  const {
    operation: { current },
  } = getState();

  if (current === undefined) return;
  // trigger cancellation within current context
  current.cancellation?.();

  debug("Cancel operation", current);
  dispatch(slice.actions.updateOperation(undefined));
});

export const operationBegin = createAsyncThunk<
  void,
  Omit<RootOperation, "id">,
  { state: RootState; dispatch: AppDispatch }
>("operation/begin", async (payload, { dispatch }) => {
  await dispatch(operationCancel()).unwrap();

  const operation = { ...payload, id: uuidv4() } as RootOperation;
  debug("Begin operation", operation);
  dispatch(slice.actions.updateOperation(operation));
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
  RootOperation | undefined,
  { state: RootState; dispatch: AppDispatch }
>("operation/complete", (payload, { dispatch, getState }) => {
  const {
    operation: { current },
  } = getState();
  if (payload === undefined || payload.id !== current?.id)
    throw new OperationRejectedError(payload?.id);

  debug("Complete operation", payload);
  // trigger finalization within current context
  payload.finalization?.();
  dispatch(slice.actions.updateOperation(undefined));
});

export const isOperationOfType = <T extends RootOperation>(
  operation: RootOperation | undefined,
  type: T["type"]
): operation is T => {
  return operation !== undefined && operation.type === type;
};
