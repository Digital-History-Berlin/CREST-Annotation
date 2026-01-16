import { useCallback } from "react";
import { useNavigateRandom } from "./use-navigate-random";
import {
  useFinishObjectMutation,
  usePushAnnotationsMutation,
} from "../../../api/enhancedApi";
import { useAppSelector } from "../../../app/hooks";
import { ObjectFilters, selectObjectFilters } from "../../../app/slice";
import {
  selectAnnotations,
  useAnnotationObject,
  useAnnotationProject,
} from "../slice/annotations";

/**
 * Provides tools to manage object state
 */
export const useObjectController = () => {
  const { navigateRandom } = useNavigateRandom();

  const project = useAnnotationProject();
  const object = useAnnotationObject();
  const filters = useAppSelector(selectObjectFilters);
  const annotations = useAppSelector(selectAnnotations);

  const [requestFinishObject] = useFinishObjectMutation();
  const [requestPush] = usePushAnnotationsMutation();

  const finishObject = useCallback(async () => {
    const annotated = !object.annotated;

    // push to external sync source if configured and marking as finished
    if (project.sync_type && annotated) {
      try {
        const body = JSON.stringify(
          annotations.map((a) => ({
            ...a,
            label: a.label && { id: a.label.id },
          }))
        );
        await requestPush({ objectId: object.id, body }).unwrap();
      } catch {
        // sync push failed, continue anyway
      }
    }

    await requestFinishObject({
      objectId: object.id,
      finished: annotated,
    }).unwrap();

    if (
      project.id &&
      filters.annotated !== undefined &&
      filters.annotated !== annotated
    )
      // update current object if neccessary
      navigateRandom(project.id);
  }, [
    requestFinishObject,
    requestPush,
    navigateRandom,
    project,
    object,
    filters,
    annotations,
  ]);

  const previousObject = useCallback(async () => {
    if (project?.id)
      navigateRandom(project.id, (filters) => ({
        ...filters,
        // navigate to the previous object
        offset: filters.offset - 1,
      }));
  }, [navigateRandom, project]);

  const nextObject = useCallback(async () => {
    if (project?.id)
      navigateRandom(project.id, (filters) => ({
        ...filters,
        // navigate to the next object
        offset: filters.offset + 1,
      }));
  }, [navigateRandom, project]);

  console.log(filters.offset);

  const changeObjectFilters = useCallback(
    (patch: Partial<ObjectFilters>) => {
      if (project?.id)
        navigateRandom(project.id, (filters) => ({
          ...filters,
          // change the filter
          ...patch,
          // navigate back to the first object
          offset: 0,
        }));
    },
    [navigateRandom, project]
  );

  return {
    navigateRandom,
    finishObject,
    nextObject,
    previousObject,
    changeObjectFilters,
  };
};
