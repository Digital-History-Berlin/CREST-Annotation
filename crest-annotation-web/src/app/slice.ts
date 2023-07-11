import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface ObjectFilters {
  annotated: boolean | undefined;
  offset: number;
}

export interface GlobalSlice {
  objectFilters: ObjectFilters;
}

const initialState: GlobalSlice = {
  objectFilters: { annotated: undefined, offset: 0 },
};

export const slice = createSlice({
  name: "global",
  initialState,
  reducers: {
    updateObjectFilters: (state, action: PayloadAction<ObjectFilters>) => {
      state.objectFilters = action.payload;
    },
  },
});

export const { updateObjectFilters } = slice.actions;

export const selectObjectFilters = (state: RootState) =>
  state.global.objectFilters;

export default slice.reducer;
