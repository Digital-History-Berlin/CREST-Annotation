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

    thunk(payload, operation, thunkApi, toolApi);
  };

export type ToolActivationThunk<C = unknown> = (
  config: C,
  thunkApi: ToolboxThunkApi
) => void;

// creates the standard tool activation thunk
export const createActivateThunk =
  <C = unknown>(
    options: { tool: Tool },
    thunk?: ToolActivationThunk<C>
  ): ToolboxThunk<ToolActivatePayload> =>
  (payload, thunkApi) => {
    const { dispatch } = thunkApi;

    dispatch(operationCancel());
    // tool is activated immediately
    dispatch(setToolboxTool(options.tool));

    // run additional logic (if any)
    if (thunk) {
      const {
        toolbox: { tools },
      } = thunkApi.getState();
      // provide default config
      thunk?.(tools[options.tool] as C, thunkApi);
    }
  };

export type ToolConfigurationThunk<C> = (
  config: C,
  thunkApi: ToolboxThunkApi
) => void;

// creates the standard tool configuration thunk
export const createConfigureThunk =
  <C>(thunk: ToolConfigurationThunk<C>): ToolboxThunk<ToolConfigurePayload> =>
  ({ config }, thunkApi) => {
    const { dispatch } = thunkApi;

    dispatch(operationCancel());
    // run configuration logic
    thunk(config as C, thunkApi);
  };

//  creates the standard labeling thunk
export const createLabelThunk =
  <T extends Extract<RootOperation, { state: { shape: Shape } }>>(options: {
    operation: T["type"];
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
