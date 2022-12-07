import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector, useEnv } from "../../app/hooks";
import { selectActiveTool, setActiveTool, Tool } from "./slice";
import { Link, Stack, ToggleButton, useTheme } from "@mui/material";
// TODO: better icons
import PenIcon from "@mui/icons-material/Gesture";
import RectangleIcon from "@mui/icons-material/Crop";
import CircleIcon from "@mui/icons-material/RadioButtonUnchecked";
import Layout from "../../components/layouts/Layout";
import Toolbar from "../../components/Toolbar";
import { ToolbarToggleButton } from "../../components/ToolbarButton";
import Canvas from "./components/Canvas";
import AnnotationsList from "./components/AnnotationsList";
import SidebarContainer from "../../components/SidebarContainer";
import LabelsList from "./components/LabelsList";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import SelectProjectDialog from "../../components/dialogs/SelectProjectDialog";
import { enhancedApi } from "../../api/enhancedApi";
import Loader from "../../components/Loader";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const env = useEnv();

  const { projectId, objectId } = useParams();

  const activeTool = useAppSelector(selectActiveTool);

  const [getRandom, { isError: randomError }] =
    enhancedApi.useLazyGetRandomObjectQuery();

  const [showProjects, setShowProjects] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const navigateRandom = async (id: string) => {
    const random = await getRandom({ projectId: id }).unwrap();
    navigate(`/annotate/${id}/${random.id}`);
  };

  useEffect(() => {
    // start with random object
    if (projectId && !objectId) navigateRandom(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, objectId]);

  const showCreateDialog = async () => {
    setShowProjects(false);
    setShowCreate(true);
  };

  const renderTools = () => (
    <Stack direction="row">
      {[
        { tool: Tool.Pen, icon: PenIcon },
        { tool: Tool.Rectangle, icon: RectangleIcon },
        { tool: Tool.Circle, icon: CircleIcon },
      ].map((button) => {
        return (
          <ToolbarToggleButton
            key={button.tool}
            value={button.tool}
            onClick={() => dispatch(setActiveTool(button.tool))}
            selected={activeTool === button.tool}
          >
            {<button.icon />}
          </ToolbarToggleButton>
        );
      })}
    </Stack>
  );

  return (
    <Layout
      header={<Toolbar tools={renderTools()} />}
      left={
        <Stack
          sx={{
            width: "300px",
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <SidebarContainer title="Annotations">
            <AnnotationsList projectId={projectId} />
          </SidebarContainer>
          <SidebarContainer title="Labels">
            <LabelsList projectId={projectId} />
          </SidebarContainer>
        </Stack>
      }
    >
      <SelectProjectDialog
        activeProjectId={projectId}
        open={!showCreate && (!projectId || showProjects)}
        onClose={() => setShowProjects(false)}
        onCreate={showCreateDialog}
      />
      <AddProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <Loader
        query={{
          isLoading: !projectId || (!objectId && !randomError),
          isError: randomError,
          data: objectId,
        }}
        errorPlaceholder={
          <PlaceholderLayout
            title="This project contains no objects."
            description={
              <>
                Go to the{" "}
                <Link href={`/project/${projectId}`}>project settings</Link> to
                scan the project source for new objects and start annotating!
              </>
            }
          />
        }
        render={({ data: objectId }) => (
          <Canvas
            imageUri={`${env.REACT_APP_BACKEND}/objects/image/${objectId}`}
          />
        )}
      />
    </Layout>
  );
};

export default AnnotatePage;
