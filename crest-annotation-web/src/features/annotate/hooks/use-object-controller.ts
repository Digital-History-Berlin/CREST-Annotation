import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFinishObjectMutation } from "../../../api/enhancedApi";
import { useAppDispatch } from "../../../app/hooks";
import {
  ObjectFilters,
  getObjectFrom,
  updateObjectFilters,
} from "../../../app/slice";
import {
  useAnnotationObject,
  useAnnotationProject,
} from "../slice/annotations";

/**
 * Provides tools to manage object state
 */
export const useObjectController = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const project = useAnnotationProject();
  const object = useAnnotationObject();

  const [requestFinishObject] = useFinishObjectMutation();

  const finishObject = useCallback(async () => {
    const annotated = !object.annotated;

    // retrieve next object before this object is completed
    const next = await dispatch(
      getObjectFrom({ objectId: object.id, offset: +1 })
    ).unwrap();

    await requestFinishObject({
      objectId: object.id,
      finished: annotated,
    }).unwrap();

    navigate(`/annotate/${project.id}/${next.id}`);
  }, [dispatch, navigate, requestFinishObject, project, object]);

  const navigateFromObject = useCallback(
    async (offset: number) => {
      await dispatch(getObjectFrom({ objectId: object.id, offset }))
        .unwrap()
        .then(({ id }) => navigate(`/annotate/${project.id}/${id}`));
    },
    [dispatch, navigate, project, object]
  );

  const nextObject = useCallback(
    () => navigateFromObject(+1),
    [navigateFromObject]
  );

  const previousObject = useCallback(
    () => navigateFromObject(-1),
    [navigateFromObject]
  );

  const changeObjectFilters = useCallback(
    (patch: Partial<ObjectFilters>) => {
      dispatch(updateObjectFilters(patch));
      // TODO: navigate to valid object
    },
    [dispatch]
  );

  return {
    finishObject,
    nextObject,
    previousObject,
    changeObjectFilters,
  };
};
