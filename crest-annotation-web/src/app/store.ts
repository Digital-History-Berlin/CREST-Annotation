import {
  configureStore,
  combineReducers,
  ThunkAction,
  Action,
} from "@reduxjs/toolkit";
import { enhancedApi } from "../api/enhancedApi";
import annotateReducer, {
  annotateMiddleware,
} from "../features/annotate/slice";

const rootReducer = combineReducers({
  annotate: annotateReducer,
  [enhancedApi.reducerPath]: enhancedApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(enhancedApi.middleware)
      .concat(annotateMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
