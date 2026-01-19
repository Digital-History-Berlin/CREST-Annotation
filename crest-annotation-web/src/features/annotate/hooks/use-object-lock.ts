import { useGetLockStatusQuery } from "../../../api/enhancedApi";
import {
  useAnnotationObject,
  useAnnotationSession,
} from "../slice/annotations";

export const useObjectLock = (): boolean | undefined => {
  const object = useAnnotationObject();
  const session = useAnnotationSession();

  const { currentData: lock, isFetching } = useGetLockStatusQuery({
    objectId: object.id,
    sessionId: session,
  });

  // ensure lock is stale while fetching
  return isFetching ? undefined : lock?.locked;
};
