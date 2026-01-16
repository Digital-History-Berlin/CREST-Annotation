import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { enhancedApi } from "../api/enhancedApi";

export interface ObjectFilters {
  annotated: boolean | undefined;
  synced: boolean | undefined;
}

export interface GlobalSlice {
  objectFilters: ObjectFilters;
  // current project
  projectId?: string;
}

const initialState: GlobalSlice = {
  objectFilters: { annotated: undefined, synced: undefined },
};

export const slice = createSlice({
  name: "global",
  initialState,
  reducers: {
    updateObjectFilters: (
      state,
      action: PayloadAction<Partial<ObjectFilters>>
    ) => {
      state.objectFilters = {
        ...state.objectFilters,
        ...action.payload,
      };
    },
    updateProject: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
  },
});

export const { updateObjectFilters, updateProject } = slice.actions;

export const selectObjectFilters = (state: RootState) =>
  state.global.objectFilters;

export const getObjectAt = createAsyncThunk(
  "getObjectAt",
  async (
    { projectId, offset = 0 }: { projectId: string; offset?: number },
    { dispatch, getState }
  ) => {
    const state = getState() as RootState;

    // search with the active object filters
    return await dispatch(
      enhancedApi.endpoints.getObjectAt.initiate({
        projectId,
        offset,
        ...state.global.objectFilters,
      })
    ).unwrap();
  }
);

export const getObjectFrom = createAsyncThunk(
  "getObjectFrom",
  async (
    { objectId, offset }: { objectId: string; offset: number },
    { dispatch, getState }
  ) => {
    const state = getState() as RootState;

    // search with the active object filters
    return await dispatch(
      enhancedApi.endpoints.navigateFrom.initiate({
        objectId,
        offset,
        ...state.global.objectFilters,
      })
    ).unwrap();
  }
);

export default slice.reducer;
