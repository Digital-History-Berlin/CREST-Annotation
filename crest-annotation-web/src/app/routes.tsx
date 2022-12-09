import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "../App";
import AnnotatePage from "../features/annotate";
import ObjectsPage from "../features/objects";
import ProjectPage from "../features/project";
import ProjectsPage from "../features/projects";

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
      <Route index element={<ProjectsPage />} />
      <Route path="project/:projectId" element={<ProjectPage />} />
      <Route path="objects/:projectId" element={<ObjectsPage />} />
      <Route path="annotate" element={<AnnotatePage />} />
      <Route path="annotate/:projectId" element={<AnnotatePage />} />
      <Route path="annotate/:projectId/:objectId" element={<AnnotatePage />} />
    </Route>
  )
);
