import { createAsyncThunk } from "@reduxjs/toolkit";
import { Configuration as DefaultConfiguration } from "./Configuration";
import { CvAlgorithm, CvBackendConfig, CvToolState } from "./types";
import { configPaneRegistry, previewRegistry, thunksRegistry } from "..";
import { cvInfo } from "../../../../api/cvApi";
import { AppDispatch, RootState } from "../../../../app/store";
import {
  activateTool,
  resetToolState,
  updateToolState,
} from "../../slice/toolbox";
import { ConfigFC } from "../../types/components";
import { ToolSelectors } from "../../types/thunks";
import { Tool, ToolGroup, ToolStatus } from "../../types/toolbox";
import { createActivateThunk } from "../custom-tool";

const activate = createActivateThunk<CvToolState>(
  { tool: Tool.Cv },
  async (state, { dispatch }) => {
    const url = localStorage.getItem("cv-backend");
    const id = localStorage.getItem("cv-algorithm");

    if (state?.backend !== undefined || !url?.length) return;

    console.log("Restoring CV state from local storage");
    const backend = await dispatch(cvValidateBackend({ url })).unwrap();
    const algorithm = backend?.algorithms?.find((a) => a.id === id);
    if (algorithm) await dispatch(cvActivateAlgorithm({ algorithm })).unwrap();
  }
);

export const cvThunks = {
  activate,
};

export const cvSelectors: ToolSelectors<CvToolState | undefined> = {
  info: (state) => ({
    status: state?.status ?? ToolStatus.Failed,
    group: ToolGroup.Cv,
    icon: {
      name: "mdi:auto-fix",
      style: { fontSize: "25px" },
      tooltip: "Computer Vision",
    },
  }),
};

// validate the given backend and load the algorithms
export const cvValidateBackend = createAsyncThunk<
  CvBackendConfig,
  { url: string },
  { state: RootState; dispatch: AppDispatch }
>("toolbox/cv/validateBackend", async ({ url }, { dispatch }) => {
  console.log(`Validating CV backend at ${url}`);

  try {
    const response = await cvInfo(url);
    const { algorithms } = await response.json();
    const backend: CvBackendConfig = { url, state: true, algorithms };

    // completely reset the tool when the backend changes
    // (the tool is not ready until an algorithm is selected)
    localStorage.setItem("cv-backend", url);
    dispatch(
      resetToolState<CvToolState>({
        tool: Tool.Cv,
        state: { status: ToolStatus.Failed, backend },
      })
    );

    return backend;
  } catch (error) {
    // invalidate the backend on failure
    localStorage.removeItem("cv-backend");
    dispatch(
      updateToolState<CvToolState>({
        tool: Tool.Cv,
        state: {
          status: ToolStatus.Failed,
          backend: { url, state: false },
          algorithm: undefined,
        },
      })
    );

    // re-throw to notify caller
    throw error;
  }
});

// activate the given algorithm and inject it into the toolbox
export const cvActivateAlgorithm = createAsyncThunk<
  void,
  { algorithm: CvAlgorithm },
  { state: RootState; dispatch: AppDispatch }
>("toolbox/cv/activateAlgorithm", async ({ algorithm }, { dispatch }) => {
  const { id, frontend } = algorithm;
  console.log(`Loading algorithm ${id} with frontend ${frontend}`);

  try {
    // reset current algorithm state
    dispatch(
      updateToolState<CvToolState>({
        tool: Tool.Cv,
        state: {
          status: ToolStatus.Loading,
          config: undefined,
          data: undefined,
        },
      })
    );

    // import the required modules
    const { Preview } = await import(`./${frontend}/Preview`);
    const { Configuration } = await import(`./${frontend}/Configuration`);
    const thunks = await import(`./${frontend}/thunks`);

    // inject the tool into the toolbox
    // (this will not trigger re-rendering)
    previewRegistry[Tool.Cv] = Preview;
    configPaneRegistry[Tool.Cv] = Configuration ?? DefaultConfiguration;
    thunksRegistry[Tool.Cv] = {
      activate: thunks.activate,
      configure: thunks.configure,
      gesture: thunks.gesture,
      label: thunks.label,
    };

    // update the algorithm on success
    localStorage.setItem("cv-algorithm", id);
    dispatch(
      updateToolState<CvToolState>({
        tool: Tool.Cv,
        state: { algorithm: { ...algorithm, state: true } },
      })
    );

    // TODO: load presets
    console.log("Activating algorithm");
    // run the new activation algorithm
    await dispatch(activateTool({ tool: Tool.Cv })).unwrap();
  } catch (error) {
    // invalidate the tool state on failure
    localStorage.removeItem("cv-algorithm");
    dispatch(
      updateToolState<CvToolState>({
        tool: Tool.Cv,
        state: {
          status: ToolStatus.Failed,
          algorithm: { ...algorithm, state: false },
        },
      })
    );

    // re-throw to notify caller
    throw error;
  }
});

// deactivate the current algorithm and reset the tool state
export const cvResetAlgorithm = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>("toolbox/cv/activateAlgorithm", async (_, { dispatch }) => {
  console.log("Deactivating algorithm");
  // clear the algorithm from local storage
  localStorage.removeItem("cv-algorithm");

  // reset the toolbox
  // (this will not trigger re-rendering)
  previewRegistry[Tool.Cv] = undefined;
  configPaneRegistry[Tool.Cv] = DefaultConfiguration as ConfigFC;
  thunksRegistry[Tool.Cv] = { activate };

  dispatch(activateTool({ tool: Tool.Cv }));
  // trigger re-rendering
  dispatch(
    updateToolState<CvToolState>({
      tool: Tool.Cv,
      state: {
        status: ToolStatus.Failed,
        config: undefined,
        data: undefined,
      },
    })
  );
});
