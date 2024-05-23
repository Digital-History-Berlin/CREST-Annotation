import { withBeginOperationContext } from "./create-custom-tool";
import { Object as DataObject, Project } from "../../../api/openApi";
import { updateToolState } from "../slice/toolbox";
import {
  OperationContextApi,
  OperationContextCallback,
} from "../types/operation-thunks";
import { Tool, ToolStatus } from "../types/toolbox";
import { InitializationOperation } from "../types/toolbox-operations";
import { ToolboxThunk, ToolboxThunkApi } from "../types/toolbox-thunks";

export type ToolLoaderApi<T> = {
  // dispatch a tool state update
  // (this will ensure the operation is still active)
  dispatchToolState: (state: Partial<T>) => void;
};

export type ToolLoaderThunkPayload<C> = {
  config: C | undefined;
  project: Project;
  object: DataObject;
  image: string;
};

export type ToolLoaderThunk<T, C> = (
  payload: ToolLoaderThunkPayload<C>,
  loaderApi: ToolLoaderApi<T>,
  contextApi: OperationContextApi<InitializationOperation>,
  thunkApi: ToolboxThunkApi
) => Promise<void>;

/**
 * Create the context API for the tool loader
 *
 * The API is provided for tool loading thunks and encapsulates some of the
 * repetitive tasks (like updating progress or tool state).
 */
const createLoaderApi = <T>(
  tool: Tool,
  contextApi: OperationContextApi<InitializationOperation>
): ToolLoaderApi<T> => {
  return {
    dispatchToolState: (state: Partial<T>) =>
      contextApi.dispatch(updateToolState<T>({ tool, state })),
  };
};

// creates an asynchronous tool preparation thunk
export const createLoaderThunk =
  <T extends { status: ToolStatus }, C = unknown>(
    options: { tool: Tool; name?: string; progress?: number },
    thunk: ToolLoaderThunk<T, C>
  ): ToolboxThunk<{ state: T | undefined; config: C | undefined }> =>
  ({ config }, thunkApi) => {
    const { project, object, image } = thunkApi.getState().annotations;

    // default cancellation
    const cancellation = () =>
      thunkApi.dispatch(
        updateToolState({
          tool: options.tool,
          state: { status: ToolStatus.Failed },
        })
      );

    // asynchronous loading operation
    // ensures that the image is ready and provides API callbacks
    const execute: OperationContextCallback<InitializationOperation> = async (
      contextApi
    ) => {
      if (!project || !object || !image)
        // wait until the image is available
        throw new Error("Image not ready");

      const loaderApi = createLoaderApi(options.tool, contextApi);
      await thunk(
        { config, project, object, image },
        loaderApi,
        contextApi,
        thunkApi
      );
    };

    return withBeginOperationContext<InitializationOperation>(
      {
        type: "toolbox/initialization",
        state: { tool: options.tool },
        name: options.name,
        progress: options.progress,
        cancellation,
      },
      { thunkApi, autoComplete: true },
      execute
    );
  };
