import { Object as DataObject, Project } from "../../../api/openApi";
import {
  operationBegin,
  operationCancel,
  operationComplete,
  operationUpdate,
} from "../slice/operation";
import { updateToolState } from "../slice/toolbox";
import { ToolboxThunk, ToolboxThunkApi } from "../types/thunks";
import { Tool, ToolStatus } from "../types/toolbox";
import { InitializationOperation } from ".";

export type ToolLoaderApi<I> = {
  operation: InitializationOperation;
  // update the operation
  progress: (name?: string, progress?: number) => void;
  // update the tool configuration
  configure: (state: I) => void;
};

export type ToolLoaderThunkPayload<I, C> = {
  info: I;
  config: C;
  project: Project;
  object: DataObject;
  image: string;
};

export type ToolLoaderThunk<I, C> = (
  payload: ToolLoaderThunkPayload<I, C>,
  thunkApi: ToolboxThunkApi,
  loaderApi: ToolLoaderApi<I>
) => Promise<void>;

// creates an asynchronous tool preparation thunk
export const createLoaderThunk =
  <I extends { status: ToolStatus }, C = unknown>(
    options: { tool: Tool; name?: string; progress?: number },
    thunk: ToolLoaderThunk<I, C>
  ): ToolboxThunk<{ info: I; config: C }> =>
  ({ info, config }, thunkApi) => {
    const { dispatch, getState } = thunkApi;
    const {
      annotations: { project, object, image },
    } = getState();

    return dispatch(
      operationBegin({
        type: "toolbox/initialization",
        state: { tool: options.tool },
        name: options.name,
        progress: options.progress,
      })
    )
      .unwrap()
      .then(async (operation) => {
        if (!project || !object || !image)
          // wait until the image is available
          throw new Error("Image not ready");

        const progress = (name?: string, progress?: number) =>
          dispatch(
            operationUpdate({
              id: operation.id,
              type: "toolbox/initialization",
              state: { tool: options.tool },
              name,
              progress,
            })
          );

        const configure = (state: I) =>
          dispatch(
            updateToolState({
              tool: options.tool,
              state,
            })
          );

        await thunk({ info, config, project, object, image }, thunkApi, {
          operation: operation as InitializationOperation,
          progress,
          configure,
        })
          // tool is ready
          .then(() => dispatch(operationComplete(operation)))
          // catch errors in thunk
          .catch((error) => {
            dispatch(operationCancel(operation));
            dispatch(
              updateToolState({
                tool: options.tool,
                state: { status: ToolStatus.Failed },
              })
            );
            // ensure error is still propagated
            throw error;
          });
      });
  };
