import { useGetLockStatusQuery } from "../../../api/enhancedApi";
import {
  useAnnotationObject,
  useAnnotationSession,
} from "../slice/annotations";

export const useObjectLock = (): boolean | undefined => {
  const object = useAnnotationObject();
  const session = useAnnotationSession();

  const { currentData: lock } = useGetLockStatusQuery({
    objectId: object.id,
    sessionId: session,
  });

  return lock?.locked;
};
