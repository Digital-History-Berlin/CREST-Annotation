import { createAsyncThunk } from "@reduxjs/toolkit";
import { Configuration as DefaultConfiguration } from "./Configuration";
import { Algorithm, CvToolInfo } from "./types";
import { configPaneRegistry, previewRegistry, thunksRegistry } from "..";
import { AppDispatch, RootState } from "../../../../app/store";
import { activateTool, patchToolState } from "../../slice/toolbox";
import { ToolSelectors } from "../../types/thunks";
import { Tool, ToolGroup, ToolStatus } from "../../types/toolbox";
import { createActivateThunk } from "../custom-tool";

const activate = createActivateThunk({ tool: Tool.Cv });

export const cvThunks = {
  activate,
};

export const cvSelectors: ToolSelectors<CvToolInfo | undefined> = {
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
  { algorithm: Algorithm },
  { state: RootState; dispatch: AppDispatch }
>("toolbox/cv/activateAlgorithm", async ({ algorithm }, { dispatch }) => {
  const { id, frontend } = algorithm;
  console.log(`Activate algorithm ${id} with frontend ${frontend}`);

  try {
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
  } catch (error) {
    console.log("Failed to load frontend", error);
    dispatch(
      patchToolState({
        tool: Tool.Cv,
        patch: { status: ToolStatus.Failed },
      })
    );
    return;
  }

  // udpate the tool state
  dispatch(patchToolState({ tool: Tool.Cv, patch: { algorithm: id } }));
  // run the new activation algorithm
  dispatch(activateTool({ tool: Tool.Cv }));
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
  configPaneRegistry[Tool.Cv] = DefaultConfiguration;
  thunksRegistry[Tool.Cv] = { activate };

  // trigger re-renering
  dispatch(activateTool({ tool: Tool.Cv }));
});
