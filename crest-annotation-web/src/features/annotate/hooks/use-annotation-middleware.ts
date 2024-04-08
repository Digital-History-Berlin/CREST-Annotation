import { useEffect, useMemo } from "react";
import {
  useGetObjectQuery,
  useGetProjectQuery,
} from "../../../api/enhancedApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateObject } from "../slice/annotations";
import { operationCancel } from "../slice/operation";

/**
 * Enable the annotation middleware and ensure it is configured correctly
 *
 * To be able to synchronize annotations with the backend, the state needs
 * to know the current project/object (see annotation slice).
 */
export const useAnnotationMiddleware = ({
  projectId,
  objectId,
  redirect,
}: {
  projectId?: string;
  objectId?: string;
  redirect: (projectId: string | undefined) => void;
}): { valid: boolean } => {
  const dispatch = useAppDispatch();

  const { currentData: remoteProject } = useGetProjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );
  const { currentData: remoteObject } = useGetObjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { objectId: objectId! },
    { skip: !objectId }
  );

  const localProject = useAppSelector((state) => state.annotations.project);
  const localObject = useAppSelector((state) => state.annotations.object);

  const valid = useMemo(() => {
    // state is incomplete
    if (!localProject || !localObject) return false;
    // state is outdated
    if (localProject !== remoteProject || localObject !== remoteObject)
      return false;
    // state is valid
    return true;
  }, [localProject, remoteProject, localObject, remoteObject]);

  useEffect(
    () => {
      // redirect because of missing project
      if (!projectId) redirect(undefined);
      // redirect because of missing object
      else if (!objectId) redirect(projectId);
      // update project and object
      else if (remoteProject && remoteObject) {
        dispatch(
          updateObject({
            project: remoteProject,
            object: remoteObject,
          })
        );
        // ensure ongoing operation is canceled when object changes
        dispatch(operationCancel());
      }
    },
    // update on project or object change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoteProject, remoteObject]
  );

  return { valid };
};
