import { AppDispatch, RootState } from "../app/store";

export type PartialAppThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
};
