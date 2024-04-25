import { v4 as uuidv4 } from "uuid";
import { addAnnotation } from "../slice/annotations";
import {
  RootOperation,
  isOperationOfType,
  operationCancel,
  operationComplete,
} from "../slice/operation";
import { setToolboxTool } from "../slice/toolbox";
import { Shape } from "../types/shapes";
import {
  ToolActivatePayload,
  ToolApi,
  ToolConfigurePayload,
  ToolLabelPayload,
  ToolSelectors,
  ToolThunk,
  ToolboxThunk,
  ToolboxThunkApi,
} from "../types/thunks";
import { Tool, ToolGroup, ToolIcon, ToolStatus } from "../types/toolbox";

export type AtomicToolThunk<P, O> = (
  payload: P,
  operation: O | undefined,
  thunkApi: ToolboxThunkApi,
  toolApi: ToolApi
) => void;

// create a bare tool thunk with immediate state access
export const createToolThunk =
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

    return thunk(payload, operation, thunkApi, toolApi);
  };

export type ToolActivationThunk<I = unknown> = (
  info: I,
  thunkApi: ToolboxThunkApi
) => void;

// creates the standard tool activation thunk
export const createActivateThunk =
  <I = unknown>(
    options: { tool: Tool },
    thunk?: ToolActivationThunk<I>
  ): ToolboxThunk<ToolActivatePayload> =>
  (payload, thunkApi) => {
    const { dispatch, getInfo } = thunkApi;

    dispatch(operationCancel());
    // tool is activated immediately
    dispatch(setToolboxTool(options.tool));
    // run additional logic (if any)
    return thunk?.(getInfo(), thunkApi);
  };

export type ToolConfigurationThunk<I, C> = (
  info: I,
  config: C,
  thunkApi: ToolboxThunkApi
) => void;

// creates the standard tool configuration thunk
export const createConfigureThunk =
  <I, C = unknown>(
    options: { tool: Tool },
    thunk: ToolConfigurationThunk<I, C>
  ): ToolboxThunk<ToolConfigurePayload> =>
  ({ config }, thunkApi) => {
    const { dispatch, getInfo } = thunkApi;

    dispatch(operationCancel());
    // run configuration logic
    return thunk(getInfo(), config as C, thunkApi);
  };

//  creates the standard labeling thunk
export const createLabelThunk =
  <T extends RootOperation>(options: {
    operation: T["type"];
    select: (operation: T) => Shape;
  }): ToolThunk<ToolLabelPayload> =>
  ({ label }, { dispatch, getState }) => {
    if (label === undefined) {
      // cancel operation if labeling was canceled
      dispatch(operationCancel());
      return;
    }

    const {
      operation: { current },
    } = getState();

    if (!isOperationOfType(current, options.operation))
      // no shape to label
      return;

    const shape = options.select(current);
    if (shape === undefined)
      // no shape to label
      return;

    dispatch(operationComplete(current));
    // create a new annotation with shape
    dispatch(
      addAnnotation({
        id: uuidv4(),
        shapes: [shape],
        label,
      })
    );
  };

//  creates a labeling thunk for a simple shape tool
export const createLabelShapeThunk = <
  T extends Extract<RootOperation, { state: { shape: Shape } }>
>(options: {
  operation: T["type"];
}): ToolThunk<ToolLabelPayload> =>
  createLabelThunk({
    ...options,
    select: (operation) => operation.state.shape,
  });

// create default tool selectors
export const createToolSelectors = (options: {
  tool: Tool;
  group: ToolGroup;
  icon: ToolIcon;
}): ToolSelectors => {
  return {
    info: () => ({
      status: ToolStatus.Ready,
      group: options.group,
      icon: options.icon,
    }),
  };
};
