import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import { enhancedApi } from "../api/enhancedApi";
import annotationsReducer, {
  annotateMiddleware,
} from "../features/annotate/slice/annotations";
import canvasReducer from "../features/annotate/slice/canvas";
import toolsReducer from "../features/annotate/slice/tools";

const rootReducer = combineReducers({
  annotations: annotationsReducer,
  canvas: canvasReducer,
  tools: toolsReducer,
  [enhancedApi.reducerPath]: enhancedApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(enhancedApi.middleware, annotateMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
