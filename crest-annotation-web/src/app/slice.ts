import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface ObjectFilters {
  annotated: boolean | undefined;
  synced: boolean | undefined;
  offset: number;
}

export interface GlobalSlice {
  objectFilters: ObjectFilters;
  // current project
  projectId?: string;
}

const initialState: GlobalSlice = {
  objectFilters: { annotated: undefined, synced: undefined, offset: 0 },
};

export const slice = createSlice({
  name: "global",
  initialState,
  reducers: {
    updateObjectFilters: (state, action: PayloadAction<ObjectFilters>) => {
      state.objectFilters = action.payload;
    },
    updateProject: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
  },
});

export const { updateObjectFilters, updateProject } = slice.actions;

export const selectObjectFilters = (state: RootState) =>
  state.global.objectFilters;

export default slice.reducer;
