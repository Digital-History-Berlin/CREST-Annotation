import { useCallback } from "react";
import { cvResetAlgorithm } from "./thunks";
import { CvToolState } from "./types";
import { useAppDispatch } from "../../../../app/hooks";
import { useToolStateSelector } from "../../hooks/use-tool-state";
import { updateToolState } from "../../slice/toolbox";
import { Tool } from "../../types/toolbox";

// enable local debug logs
const debug = false;

export const useCvResetAlgorithm = () => {
  const dispatch = useAppDispatch();

  // reset the CV tool state to select a new algorithm
  return useCallback(() => dispatch(cvResetAlgorithm()), [dispatch]);
};

export const useCvToolConfig = <T>({
  frontend,
  defaultConfig,
}: {
  frontend: string;
  defaultConfig: T;
}) => {
  const dispatch = useAppDispatch();

  const config = useToolStateSelector(
    Tool.Cv,
    (state: CvToolState | undefined) =>
      state?.algorithm?.frontend === frontend && state.config
        ? (state?.config as T)
        : defaultConfig
  );

  const updateConfig = useCallback(
    (patch: Partial<T>) => {
      if (debug) console.debug("Updating tool config", patch);
      dispatch(
        updateToolState<CvToolState>({
          tool: Tool.Cv,
          // partial update for CV tool configuration
          state: { config: { ...config, ...patch } },
        })
      );
    },
    [dispatch, config]
  );

  return {
    config,
    updateConfig,
  };
};

export const useCvToolData = <T>({
  frontend,
  defaultData,
}: {
  frontend: string;
  defaultData: T;
}) => {
  const dispatch = useAppDispatch();

  const data = useToolStateSelector(Tool.Cv, (state: CvToolState | undefined) =>
    state?.algorithm?.frontend === frontend && state.data
      ? (state?.data as T)
      : defaultData
  );

  const updateData = useCallback(
    (patch: Partial<T>) => {
      if (debug) console.debug("Updating tool data", patch);
      dispatch(
        updateToolState<CvToolState>({
          tool: Tool.Cv,
          // partial update for CV tool configuration
          state: { data: { ...data, ...patch } },
        })
      );
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
