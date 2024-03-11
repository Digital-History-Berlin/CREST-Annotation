import { createAsyncThunk } from "@reduxjs/toolkit";
import { shapeMap } from "./components/tools/Shape";
import { ShapeToolEvent } from "./components/tools/Types";
import { Annotation, updateAnnotations } from "./slice/annotations";
import {
  Tool,
  ToolState,
  setActiveTool,
  updateActiveTool,
} from "./slice/tools";
import { enhancedApi } from "../../api/enhancedApi";
import { AppDispatch, RootState } from "../../app/store";

export const pullAnnotations = createAsyncThunk(
  "annotations/pullAnnotations",
  async (
    { objectId, projectId }: { objectId: string; projectId: string },
    { dispatch }
  ) => {
    // re-fetch the annotations
    const json = await dispatch(
      enhancedApi.endpoints.getAnnotations.initiate(
        { objectId: objectId },
        { forceRefetch: true }
      )
    ).unwrap();
    // request the labels for hydration
    const labels = await dispatch(
      enhancedApi.endpoints.getProjectLabels.initiate({
        projectId: projectId,
      })
    ).unwrap();
    // map labels to their identifiers
    const lookup = Object.fromEntries(labels.map((label) => [label.id, label]));
    // hydrate the annotations
    const annotations: Annotation[] = JSON.parse(json).map(
      (annotation: Annotation) => ({
        ...annotation,
        label: annotation.label && lookup[annotation.label.id],
      })
    );
    // update the store
    dispatch(updateAnnotations(annotations));
  }
);

export const activateTool = createAsyncThunk<
  void,
  { tool: Tool } & ShapeToolEvent,
  { state: RootState; dispatch: AppDispatch }
>(
  "annotations/activateTool",
  async ({ tool, ...event }, { dispatch, getState }) => {
    console.debug(`Selected tool ${tool}`);

    // get the tools current configuration
    const config = getState().configs[tool];

    // asynchronously initialize the tool
    const initializer = shapeMap[tool]?.onBegin;
    if (initializer) {
      dispatch(setActiveTool({ tool, config, state: ToolState.Loading }));

      return Promise.resolve(initializer(event, config))
        .then(() => {
          dispatch(updateActiveTool({ state: ToolState.Ready }));
          console.debug("Tool activated");
        })
        .catch((error) => {
          dispatch(updateActiveTool({ state: ToolState.Failed }));
          console.error("Failed to activate tool", error);
        });
    }

    // synchronously activate the tool
    dispatch(setActiveTool({ tool, config, state: ToolState.Ready }));
  }
);
