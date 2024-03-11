import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Tool } from "./tools";

export type Algorithm = { id: string; name: string };

export interface SegmentConfig {
  backend?: string;
  state?: boolean;
  algorithms?: Algorithm[];
  algorithm?: string;
  // algorithm specific config
  details?: { [key: string]: unknown };
}

export interface ConfigsSlice {
  [Tool.Pen]: undefined;
  [Tool.Circle]: undefined;
  [Tool.Rectangle]: undefined;
  [Tool.Polygon]: undefined;
  [Tool.Edit]: undefined;
  [Tool.Segment]: SegmentConfig;
}

const initialState: ConfigsSlice = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: undefined,
  [Tool.Segment]: {},
};

export const slice = createSlice({
  name: "configs",
  initialState,
  reducers: {
    updateToolConfig: (
      state,
      // add typings as needed
      action: PayloadAction<{
        tool: Tool.Segment;
        config: Partial<SegmentConfig>;
      }>
    ) => {
      // patch the state
      state[action.payload.tool] = {
        ...state[action.payload.tool],
        ...action.payload.config,
      };
    },
  },
});

export const { updateToolConfig } = slice.actions;

export default slice.reducer;
