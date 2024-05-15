import { Object as DataObject, Project } from "../../../api/openApi";
import {
  AsyncOperationCallback,
  operationBeginWithAsync,
  throwIfRejected,
} from "../slice/operation";
import { updateToolState } from "../slice/toolbox";
import { ToolboxThunk, ToolboxThunkApi } from "../types/thunks";
import { Tool, ToolStatus } from "../types/toolbox";
import { InitializationOperation } from ".";

export type ToolLoaderApi<T> = {
  operation: InitializationOperation;
  // update the initialization operation
  // (this will ensure the operation is still active)
  progress: (name?: string, progress?: number) => void;
  // dispatch a tool state update
  // (this will ensure the operation is still active)
  dispatchToolState: (state: Partial<T>) => void;
};

export type ToolLoaderThunkPayload<T, C> = {
  state: T | undefined;
  config: C | undefined;
  project: Project;
  object: DataObject;
  image: string;
};

export type ToolLoaderThunk<T, C> = (
  payload: ToolLoaderThunkPayload<T, C>,
  thunkApi: ToolboxThunkApi,
  loaderApi: ToolLoaderApi<T>
) => Promise<void>;

// creates an asynchronous tool preparation thunk
export const createLoaderThunk =
  <T extends { status: ToolStatus }, C = unknown>(
    options: { tool: Tool; name?: string; progress?: number },
    thunk: ToolLoaderThunk<T, C>
  ): ToolboxThunk<{ state: T | undefined; config: C | undefined }> =>
  ({ state, config }, thunkApi) => {
    const { dispatch, getState } = thunkApi;
    const {
      annotations: { project, object, image },
    } = getState();

    // default cancellation
    const cancellation = () =>
      dispatch(
        updateToolState({
          tool: options.tool,
          state: { status: ToolStatus.Failed },
        })
      );

    // asynchronous loading operation
    // ensures that the image is ready and provides API callbacks
    const execute: AsyncOperationCallback<InitializationOperation> = async ({
      operation,
      update,
      complete,
    }) => {
      if (!project || !object || !image)
        // wait until the image is available
        throw new Error("Image not ready");

      const progress = (name?: string, progress?: number) =>
        update({
          type: "toolbox/initialization",
          state: { tool: options.tool },
          name,
          progress,
        });

      const dispatchToolState = (state: Partial<T>) => {
        throwIfRejected(operation, getState());
        // ensure tool state is updated from active operation only
        dispatch(
          updateToolState<T>({
            tool: options.tool,
            state,
          })
        );
      };

      await thunk({ state, config, project, object, image }, thunkApi, {
        operation,
        progress,
        dispatchToolState,
      })
        // tool is ready
        .then(() => complete());
    };

    return operationBeginWithAsync(
      { dispatch },
      {
        type: "toolbox/initialization",
        state: { tool: options.tool },
        name: options.name,
        progress: options.progress,
        cancellation,
      },
      execute
    );
  };
