import { useCallback } from "react";
import { cvResetAlgorithm } from "./thunks";
import { CvToolState } from "./types";
import { useAppDispatch } from "../../../../app/hooks";
import { useToolStateSelector } from "../../hooks/use-tool-state";
import { updateToolState } from "../../slice/toolbox";
import { Tool } from "../../types/toolbox";

export const useCvResetAlgorithm = () => {
  const dispatch = useAppDispatch();

  // reset the CV tool state to select a new algorithm
  return useCallback(() => dispatch(cvResetAlgorithm()), [dispatch]);
};

export const useCvToolConfig = <T>(frontend: string) => {
  const dispatch = useAppDispatch();

  const config = useToolStateSelector(
    Tool.Cv,
    (state: CvToolState | undefined) =>
      state?.algorithm?.frontend === frontend
        ? (state.config as T | undefined)
        : undefined
  );

  const updateConfig = useCallback(
    (patch: Partial<T>) => {
      const state = { config: { ...config, ...patch } };
      dispatch(updateToolState<CvToolState>({ tool: Tool.Cv, state }));
      // store changes in local storage
      localStorage.setItem(frontend, JSON.stringify(state.config));
    },
    [dispatch, config, frontend]
  );

  return {
    config,
    updateConfig,
  };
};

export const useCvToolData = <T>(frontend: string) => {
  const dispatch = useAppDispatch();

  const data = useToolStateSelector(Tool.Cv, (state: CvToolState | undefined) =>
    state?.algorithm?.frontend === frontend
      ? (state.data as T | undefined)
      : undefined
  );

  const updateData = useCallback(
    (patch: Partial<T>) => {
      const state = { data: { ...data, ...patch } };
      dispatch(updateToolState<CvToolState>({ tool: Tool.Cv, state }));
    },
    [dispatch, data]
  );

  return {
    data,
    updateData,
  };
};

export const useCvToolBackend = () => {
  const backend = useToolStateSelector(
    Tool.Cv,
    (state: CvToolState | undefined) => state?.backend
  );

  return backend;
};

export const useCvToolAlgorithm = () => {
  const algorithm = useToolStateSelector(
    Tool.Cv,
    (state: CvToolState | undefined) => state?.algorithm
  );

  return algorithm;
};
