import { createAsyncThunk } from "@reduxjs/toolkit";
import { Configuration as DefaultConfiguration } from "./Configuration";
import { Algorithm, CvToolInfo } from "./types";
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

  // reset current algorithm state
  dispatch(
    updateToolState({
      tool: Tool.Cv,
      state: { status: ToolStatus.Failed, config: undefined, data: undefined },
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

  // trigger re-rendering
  // TODO: load presets
  dispatch(updateToolState({ tool: Tool.Cv, state: { algorithm: id } }));
  // run the new activation algorithm
  await dispatch(activateTool({ tool: Tool.Cv })).unwrap();
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
    updateToolState({
      tool: Tool.Cv,
      state: { status: ToolStatus.Failed, config: undefined, data: undefined },
    })
  );
});
