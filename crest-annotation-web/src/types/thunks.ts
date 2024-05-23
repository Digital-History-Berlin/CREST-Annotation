import { AsyncThunkAction, createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../app/store";

export type PartialAppThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
};

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export type AppAsyncThunk<
  Returned = void,
  QueryThunkArg = void
> = AsyncThunkAction<
  Returned,
  QueryThunkArg,
  { dispatch: AppDispatch; state: RootState }
>;
