import { useCallback } from "react";
import { useNavigateRandom } from "./use-navigate-random";
import { useFinishObjectMutation } from "../../../api/enhancedApi";
import { useAppSelector } from "../../../app/hooks";
import { selectObjectFilters } from "../../../app/slice";
import {
  useAnnotationObject,
  useAnnotationProject,
} from "../slice/annotations";

/// Toolbox to manage object state
export const useObjectController = () => {
  const { navigateRandom } = useNavigateRandom();

  const project = useAnnotationProject();
  const object = useAnnotationObject();
  const filters = useAppSelector(selectObjectFilters);

  const [requestFinishObject] = useFinishObjectMutation();
  const finishObject = useCallback(async () => {
    const annotated = !object.annotated;
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
  }, [requestFinishObject, navigateRandom, project, object, filters]);

  const skipObject = useCallback(async () => {
    if (project?.id)
      navigateRandom(project.id, (filters) => ({
        ...filters,
        // navigate to the next object
        offset: filters.offset + 1,
      }));
  }, [navigateRandom, project]);

  const changeObjectFilters = useCallback(
    (annotated: boolean | undefined) => {
      if (project?.id)
        navigateRandom(project.id, (filters) => ({
          ...filters,
          // change the filter
          annotated,
          // navigate back to the first object
          offset: 0,
        }));
    },
    [navigateRandom, project]
  );

  return {
    navigateRandom,
    finishObject,
    skipObject,
    changeObjectFilters,
  };
};
