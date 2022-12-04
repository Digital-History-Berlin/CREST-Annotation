import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "../App";
import AnnotatePage from "../features/annotate";

// TODO: move to routes
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<App />}
      //loader={rootLoader}
      //action={rootAction}
      //errorElement={<ErrorPage />}
    >
      <Route index element={<AnnotatePage />} />
      <Route path="annotate/:projectId/:objectId" element={<AnnotatePage />} />
    </Route>
  )
);
