import { createAsyncThunk } from "@reduxjs/toolkit";
import { Configuration as DefaultConfiguration } from "./Configuration";
import { CvAlgorithm, CvToolState } from "./types";
import { configPaneRegistry, previewRegistry, thunksRegistry } from "..";
import { AppDispatch, RootState } from "../../../../app/store";
import { activateTool, updateToolState } from "../../slice/toolbox";
import { ConfigFC } from "../../types/components";
import { ToolSelectors } from "../../types/thunks";
import { Tool, ToolGroup, ToolStatus } from "../../types/toolbox";
import { createActivateThunk } from "../custom-tool";

const activate = createActivateThunk({ tool: Tool.Cv });

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
    // TODO: load presets
    dispatch(
      updateToolState<CvToolState>({
        tool: Tool.Cv,
        state: { algorithm: { ...algorithm, state: true } },
      })
    );

    console.log("Activating algorithm");
    // run the new activation algorithm
    await dispatch(activateTool({ tool: Tool.Cv })).unwrap();
  } catch (error) {
    // invalidate the tool state on failure
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
