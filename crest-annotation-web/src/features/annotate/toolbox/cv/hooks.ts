import { useCallback } from "react";
import { cvResetAlgorithm } from "./thunks";
import { CvBackendConfig, CvToolOperationState, CvToolState } from "./types";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { resetToolState, updateToolState } from "../../slice/toolbox";
import { Tool, ToolStatus } from "../../types/toolbox";
import { useToolStateSelector } from "../hooks";

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
  const dispatch = useAppDispatch();

  const backend = useToolStateSelector(
    Tool.Cv,
    (state: CvToolState | undefined) => state?.backend
  );

  const updateBackend = useCallback(
    (backend: CvBackendConfig) => {
      if (debug) console.debug("Updating backend", backend);
      dispatch(
        // reset the tool when the backend changes
        // (the tool is not ready until an algorithm is selected)
        resetToolState<CvToolState>({
          tool: Tool.Cv,
          state: { status: ToolStatus.Failed, backend },
        })
      );
    },
    [dispatch]
  );

  return {
    backend,
    updateBackend,
  };
};

export const useCvToolAlgorithm = () => {
  const algorithm = useToolStateSelector(
    Tool.Cv,
    (state: CvToolState | undefined) => state?.algorithm
  );

  return {
    algorithm,
  };
};

export const useCvToolOperationState = <T extends CvToolOperationState>(
  task: T["task"]
): T | undefined => {
  return useAppSelector((state) =>
    state.operation.current?.type === "tool/cv" &&
    state.operation.current.state.task === task
      ? (state.operation.current.state as T)
      : undefined
  );
};
