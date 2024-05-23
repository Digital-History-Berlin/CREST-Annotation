import { v4 as uuidv4 } from "uuid";
import { AppDispatch } from "../../../app/store";
import { createAppAsyncThunk } from "../../../types/thunks";
import { addAnnotation } from "../slice/annotations";
import {
  operationBegin,
  operationCancel,
  operationChain,
  operationComplete,
  operationUpdate,
} from "../slice/operation";
import { createToolboxApi, setToolboxTool } from "../slice/toolbox";
import {
  OperationRejectedError,
  OperationTypeError,
  isOperationOfGroup,
  isOperationOfType,
} from "../types/operation";
import {
  OperationContextApi,
  OperationContextCallback,
  OperationContextFallback,
  OperationContextOptions,
} from "../types/operation-thunks";
import { Shape } from "../types/shapes";
import { Tool, ToolGroup, ToolIcon, ToolStatus } from "../types/toolbox";
import {
  AtomicToolOperation,
  ToolOperation,
} from "../types/toolbox-operations";
import {
  CustomToolThunk,
  ToolActivatePayload,
  ToolConfigurePayload,
  ToolLabelPayload,
  ToolSelectors,
  ToolThunk,
  ToolboxThunk,
  ToolboxThunkApi,
} from "../types/toolbox-thunks";

/**
 * Create the context API for the operation
 *
 * The API is provided when wrapping an callback within an operation
 * (withOperationContext()) and encapsulates some of the repetitive tasks (like
 * dispatching operation changes).
 */
const createContextApi = <O extends ToolOperation>(
  contextId: string | undefined,
  { thunkApi, ...options }: OperationContextOptions<O>
): OperationContextApi<O> => {
  const getState = (): O => {
    const { id, current } = thunkApi.getState().operation;
    if (id === undefined || id !== contextId)
      throw new OperationRejectedError(contextId);
    if (
      (options.type && !isOperationOfType<O>(current, options.type)) ||
      (options.prefix && !isOperationOfGroup<O>(current, options.prefix))
    )
      throw new OperationTypeError({
        prefix: options.prefix,
        type: options.type,
        current: current?.type,
      });
    // context type or group should be properly configured
    return current as O;
  };

  const dispatch = (...args: Parameters<AppDispatch>) => {
    getState();
    // dispatch only if the state is still valid
    return thunkApi.dispatch(...args);
  };

  const apply = (callback: (operation: O) => O) => {
    const operation = callback(getState());
    return thunkApi
      .dispatch(operationUpdate({ id: contextId, operation }))
      .unwrap();
  };

  return {
    dispatch: dispatch as AppDispatch,
    getState,

    cancel: () =>
      thunkApi.dispatch(operationCancel({ id: contextId })).unwrap(),
    update: (operation: O) =>
      thunkApi.dispatch(operationUpdate({ id: contextId, operation })).unwrap(),
    complete: () =>
      thunkApi.dispatch(operationComplete({ id: contextId })).unwrap(),

    apply,
    progress: (name?: string, progress?: number) =>
      apply((current) => ({ ...current, name, progress })),
    state: (state: O["state"]) => apply((current) => ({ ...current, state })),
  };
};

/**
 * Execute the given callback within the context of an operation
 *
 * This provides a safe environment for executing actions that are related to
 * operations. It encapsulates the boilderplate code for managing operations.
 */
export const withOperationContext = <O extends ToolOperation>(
  id: string | undefined,
  options: OperationContextOptions<O>,
  callback: OperationContextCallback<O>
): Promise<void> => {
  const context = createContextApi<O>(id, options);
  return Promise.resolve(callback(context))
    .then(() => {
      if (options.autoComplete) context.complete();
    })
    .catch((error) => {
      if (options.cancelOnError) context.cancel();
      if (options.throwOnError) throw error;
      else console.error(error);
    });
};

/// Use the current operation as operation context
export const withCurrentOperationContext = <O extends ToolOperation>(
  options: OperationContextOptions<O>,
  callback: OperationContextCallback<O>,
  fallback?: OperationContextFallback
): Promise<void> => {
  const { id, current } = options.thunkApi.getState().operation;

  if (
    (options.type && !isOperationOfType<O>(current, options.type)) ||
    (options.prefix && !isOperationOfGroup<O>(current, options.prefix))
  ) {
    if (!fallback)
      throw new OperationTypeError({
        prefix: options.prefix,
        type: options.type,
        current: current?.type,
      });

    return Promise.resolve(fallback());
  }

  return withOperationContext<O>(id, options, callback);
};

/// Begin an operation as operation context
export const withBeginOperationContext = <O extends ToolOperation>(
  operation: O,
  options: OperationContextOptions<O>,
  callback: OperationContextCallback<O>
): Promise<void> =>
  options.thunkApi
    .dispatch(operationBegin({ operation }))
    .unwrap()
    .then((id) => withOperationContext<O>(id, options, callback));

/// Chain an operation as operation context
export const withChainOperationContext = <O extends ToolOperation>(
  id: string | undefined,
  operation: O,
  options: OperationContextOptions<O>,
  callback: OperationContextCallback<O>
): Promise<void> =>
  options.thunkApi
    .dispatch(operationChain({ id, operation }))
    .unwrap()
    .then((id) => withOperationContext<O>(id, options, callback));

export type ToolActivationThunk<T = unknown> = (
  state: T | undefined,
  thunkApi: ToolboxThunkApi
) => void;

/**
 * Create the standard tool activation thunk
 *
 * It will cancel ongoing operations and update the selected toolbox tool.
 * Additional initialization thunks can be executed afterwards.
 */
export const createActivateThunk =
  <T = unknown>(
    options: { tool: Tool },
    thunk?: ToolActivationThunk<T>
  ): ToolboxThunk<ToolActivatePayload> =>
  (payload, thunkApi) => {
    const { dispatch, getToolState } = thunkApi;

    dispatch(operationCancel({ id: undefined }));
    // tool is activated immediately
    dispatch(setToolboxTool(options.tool));
    // run additional logic (if any)
    return thunk?.(getToolState(), thunkApi);
  };

export type ToolConfigurationThunk<T, C> = (
  state: T | undefined,
  config: C | undefined,
  thunkApi: ToolboxThunkApi
) => void;

/**
 * Create the standard tool configuration thunk
 *
 * It will cancel ongoing operations and execute the configuration thunk, which
 * will be provided with the current tool state as well as the configuration
 * update.
 */
export const createConfigureThunk =
  <T, C = unknown>(
    options: { tool: Tool },
    thunk: ToolConfigurationThunk<T, C>
  ): ToolboxThunk<ToolConfigurePayload> =>
  ({ config }, thunkApi) => {
    const { dispatch, getToolState } = thunkApi;

    dispatch(operationCancel({ id: undefined }));
    // run configuration logic
    return thunk(getToolState(), config as C, thunkApi);
  };

/**
 * Create the standard labeling thunk
 *
 * It will create a single annotation using the given label. The shape is
 * extracted from the operation and the operation is completed.
 */
export const createLabelThunk =
  <O extends ToolOperation>(options: {
    operation: O["type"];
    select: (operation: O) => Shape;
  }): ToolThunk<ToolLabelPayload> =>
  ({ label }, { dispatch, getState }): void => {
    const { id, current } = getState().operation;

    // extract the shape from operation state
    const shape = isOperationOfGroup<O>(current, "tool/")
      ? options.select(current)
      : undefined;

    // cancel operation if data is missing
    if (label === undefined || shape === undefined)
      return void dispatch(operationCancel({ id }));

    dispatch(operationComplete({ id }));
    // create a new annotation with shape
    dispatch(
      addAnnotation({
        id: uuidv4(),
        shapes: [shape],
        label,
      })
    );
  };

/**
 * Create a labeling thunk for an atomic (single shape) tool
 */
export const createLabelShapeThunk = <O extends AtomicToolOperation>(options: {
  operation: O["type"];
}): ToolThunk<ToolLabelPayload> =>
  createLabelThunk({
    ...options,
    select: (operation) => operation.state.shape,
  });

/**
 * Create a custom thunk (not a tool thunk)
 *
 * The thunk can be used directly from tool-specific UI elements, which do not
 * require the dynamic thunk mapping that is provided by the toolbox.
 */
export const createCustomToolThunk = <P>(
  prefix: string,
  tool: Tool,
  thunk: CustomToolThunk<P>
) =>
  createAppAsyncThunk(prefix, async (payload: P, api) =>
    thunk(payload, createToolboxApi(api, tool))
  );

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
