import { createAsyncThunk } from "@reduxjs/toolkit";
import { Annotation, updateAnnotations } from "./slice/annotations";
import { enhancedApi } from "../../api/enhancedApi";

export const pullAnnotations = createAsyncThunk(
  "annotations/pullAnnotations",
  async (
    { objectId, projectId }: { objectId: string; projectId: string },
    { dispatch }
  ) => {
    console.log(objectId);
    console.log(projectId);
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
