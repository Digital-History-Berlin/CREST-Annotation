import { useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useGetImageUriQuery,
  useGetObjectQuery,
  useGetProjectQuery,
  useLockObjectMutation,
  useUnlockObjectMutation,
} from "../../../api/enhancedApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateObject } from "../slice/annotations";
import { operationCancel } from "../slice/operation";
import { activateTool } from "../slice/toolbox";

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
  redirect: () => void;
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
  const { currentData: remoteImage } = useGetImageUriQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { objectId: objectId!, imageRequest: { height: 1024 } },
    { skip: !objectId }
  );

  // control access to the object
  const [lockRequest] = useLockObjectMutation();
  const [unlockRequest] = useUnlockObjectMutation();

  const localProject = useAppSelector((state) => state.annotations.project);
  const localObject = useAppSelector((state) => state.annotations.object);
  const localImage = useAppSelector((state) => state.annotations.image);

  const valid = useMemo(() => {
    if (!localProject || !localObject || !localImage)
      // state is incomplete
      return false;

    if (
      localProject !== remoteProject ||
      localObject !== remoteObject ||
      localImage !== remoteImage
    )
      // state is outdated
      return false;

    // state is valid
    return true;
  }, [
    localProject,
    remoteProject,
    localObject,
    remoteObject,
    localImage,
    remoteImage,
  ]);

  useEffect(
    () => {
      // redirect because of invalid state
      if (!projectId || !objectId) return redirect();
      // update local state once data is available
      if (remoteProject && remoteObject && remoteImage) {
        // generate a unique session id
        const session = sessionStorage.getItem("session") || uuidv4();
        sessionStorage.setItem("session", session);

        // provide application wide access
        dispatch(
          updateObject({
            project: remoteProject,
            object: remoteObject,
            image: remoteImage,
            session: session,
          })
        );
        // ensure ongoing operation is canceled when object changes
        dispatch(operationCancel({ id: undefined }));
        // re-activate the current tool
        dispatch(activateTool({ tool: undefined }));

        // acquire remote lock on current object
        lockRequest({ objectId, sessionId: session });
        // unlock on unmount
        return () => {
          unlockRequest({ objectId, sessionId: session });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoteProject, remoteObject, remoteImage]
  );

  return { valid };
};
