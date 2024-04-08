import { v4 as uuidv4 } from "uuid";
import { addAnnotation } from "../slice/annotations";
import {
  RootOperation,
  RootOperationType,
  isOperationOfType,
  operationCancel,
  operationComplete,
} from "../slice/operation";
import { setToolboxTool } from "../slice/toolbox";
import {
  ToolActivatePayload,
  ToolApi,
  ToolLabelPayload,
  ToolThunk,
  ToolboxThunk,
  ToolboxThunkApi,
} from "../types/thunks";
import { Tool } from "../types/toolbox";

export type AtomicToolThunk<P, O> = (
  payload: P,
  operation: O | undefined,
  thunkApi: ToolboxThunkApi,
  toolApi: ToolApi
) => void;

// create a (synchronous) thunk with immediate state access
export const createAtomic =
  <P, O extends RootOperation>(
    options: { operation: O["type"] },
    thunk: AtomicToolThunk<P, O>
  ): ToolThunk<P> =>
  (payload, thunkApi, toolApi) => {
    const {
      operation: { current },
    } = thunkApi.getState();

    const operation = isOperationOfType(current, options.operation)
      ? current
      : undefined;

    thunk(payload, operation, thunkApi, toolApi);
  };

// creates the standard tool activation thunk
export const createActivate =
  (options: { tool: Tool }): ToolboxThunk<ToolActivatePayload> =>
  (payload, { dispatch }) => {
    dispatch(operationCancel());
    // tool can be activated
    dispatch(setToolboxTool(options.tool));
  };

//  creates the standard labeling thunk
export const createLabel =
  <T extends RootOperationType>(options: {
    operation: T;
  }): ToolThunk<ToolLabelPayload> =>
  ({ label }, { dispatch, getState }) => {
    if (label === undefined)
      // cancel operation if labeling was canceled
      return dispatch(operationCancel());

    const {
      operation: { current },
    } = getState();

    if (!isOperationOfType(current, options.operation))
      // no shape to label
      return;

    dispatch(operationComplete(current));
    // create a new annotation with shape
    dispatch(
      addAnnotation({
        id: uuidv4(),
        shapes: [current.state.shape],
        label,
      })
    );
  };
