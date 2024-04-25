import React, { useCallback } from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Canvas from "./components/canvas/Canvas";
import EditAnnotationDialog from "./components/dialogs/EditAnnotationDialog";
import AnnotationsContainer from "./components/sections/AnnotationsContainer";
import ConfigurationContainer from "./components/sections/ConfigurationContainer";
import LabelsContainer from "./components/sections/LabelsContainer";
import { StatusbarProgress } from "./components/sections/StatusbarProgress";
import ToolbarActions from "./components/sections/ToolbarActions";
import ToolbarTools from "./components/sections/ToolbarTools";
import { useAnnotationMiddleware } from "./hooks/use-annotation-middleware";
import { useNavigateRandom } from "./hooks/use-navigate-random";
import { cancelEditAnnotation, doneEditAnnotation } from "./slice/annotations";
import { Label } from "../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Layout from "../../components/layouts/Layout";
import { CenterContainer } from "../../components/Loader";
import Sidebar from "../../components/Sidebar";
import Toolbar from "../../components/Toolbar";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { navigateRandom } = useNavigateRandom();
  // redirect because of missing object
  const redirect = useCallback(
    (projectId: string | undefined) => {
      // select missing project
      if (!projectId) navigate("/");
      // select random object from project
      else
        navigateRandom(projectId, (filters) => ({
          ...filters,
          offset: 0,
        }));
    },
    [navigateRandom, navigate]
  );

  const { projectId, objectId } = useParams();
  const { valid } = useAnnotationMiddleware({
    projectId,
    objectId,
    redirect,
  });

  const editingAnnotation = useAppSelector(
    (state) => state.annotations.editing
  );

  const doneEditing = useCallback(
    (label: Label) => dispatch(doneEditAnnotation(label)),
    [dispatch]
  );

  const cancelEditing = useCallback(
    () => dispatch(cancelEditAnnotation()),
    [dispatch]
  );

  /*
  // TODO: error screen
  const renderError = (count = { total: 0 }) => (
    <PlaceholderLayout
      title={
        count?.total > 0
          ? "There are no more images in this project."
          : "The project does not contain any images."
      }
      description={
        <>
          Go to the
          <Link href={`/project/${projectId}`}> project settings </Link>
          to import new images or export the results!
        </>
      }
    />
  );
*/
  if (!valid)
    return (
      <Layout header={<Toolbar />}>
        <CenterContainer>
          <CircularProgress />
        </CenterContainer>
      </Layout>
    );

  return (
    <Layout
      sx={{ display: "flex" }}
      header={<Toolbar tools={<ToolbarTools />} actions={<ToolbarActions />} />}
      status={<StatusbarProgress />}
      left={
        <Sidebar position="left">
          <AnnotationsContainer />
          <LabelsContainer />
        </Sidebar>
      }
      right={
        <Sidebar position="right">
          <ConfigurationContainer />
        </Sidebar>
      }
    >
      <EditAnnotationDialog
        annotation={editingAnnotation}
        onSubmit={doneEditing}
        onClose={cancelEditing}
      />
      <Canvas />
    </Layout>
  );
};

export default AnnotatePage;
