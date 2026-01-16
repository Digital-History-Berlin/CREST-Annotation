import React, { useCallback } from "react";
import Canvas from "./components/canvas/Canvas";
import EditAnnotationDialog from "./components/dialogs/EditAnnotationDialog";
import AnnotationsContainer from "./components/sections/AnnotationsContainer";
import ConfigurationContainer from "./components/sections/ConfigurationContainer";
import { ImageDescription } from "./components/sections/ImageDescription";
import LabelsContainer from "./components/sections/LabelsContainer";
import { StatusbarProgress } from "./components/sections/StatusbarProgress";
import ToolbarActions from "./components/sections/ToolbarActions";
import ToolbarTools from "./components/sections/ToolbarTools";
import { withAnnotationMiddleware } from "./hocs/with-annotation-middleware";
import { cancelEditAnnotation, doneEditAnnotation } from "./slice/annotations";
import { Label } from "../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Layout from "../../components/layouts/Layout";
import Sidebar from "../../components/Sidebar";
import Toolbar from "../../components/Toolbar";
import ToolbarTabs from "../../components/ToolbarTabs";
import { withProject } from "../../hocs/with-project";

const AnnotatePage = withProject(
  withAnnotationMiddleware(() => {
    const dispatch = useAppDispatch();

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

    return (
      <Layout
        sx={{ display: "flex" }}
        header={
          <Toolbar
            tabs={<ToolbarTabs active="annotate" />}
            tools={<ToolbarTools />}
            actions={<ToolbarActions />}
          />
        }
        status={
          <>
            <StatusbarProgress>
              <ImageDescription />
            </StatusbarProgress>
          </>
        }
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
  })
);

export default AnnotatePage;
