import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enhancedApi } from "../../../api/enhancedApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  ObjectFilters,
  selectObjectFilters,
  updateObjectFilters,
} from "../../../app/slice";

// navigate to a random object
export const useNavigateRandom = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [navigateFailed, setNavigateFailed] = useState(false);
  const [getRandom] = enhancedApi.useGetRandomObjectMutation();
  const filters = useAppSelector(selectObjectFilters);

  // navigate to a random object
  const navigateRandom = useCallback(
    (
      projectId: string,
      updateFilters?: (current: ObjectFilters) => ObjectFilters
    ) => {
      setNavigateFailed(false);

      const patched = updateFilters ? updateFilters(filters) : filters;

      // fetch a random object
      getRandom({ projectId: projectId, ...patched })
        .unwrap()
        .then((object) => {
          navigate(`/annotate/${projectId}/${object.id}`);
          // update the filters
          dispatch(updateObjectFilters(patched));
        })
        .catch((error) => {
          console.error(error);
          // indicate failure
          setNavigateFailed(true);
        });
    },
    [getRandom, navigate, dispatch, filters]
  );

  return { navigateFailed, navigateRandom };
};
