import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectActiveTool, setActiveTool, Tool } from "./slice";
import {
  Button,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  ToggleButton,
  useTheme,
} from "@mui/material";
// TODO: better icons
import PenIcon from "@mui/icons-material/Gesture";
import RectangleIcon from "@mui/icons-material/Crop";
import CircleIcon from "@mui/icons-material/RadioButtonUnchecked";
import Layout from "../../components/Layout";
import Toolbar from "../../components/Toolbar";
import ToolbarButtonGroup from "../../components/ToolbarButtonGroup";
import Canvas from "./components/Canvas";
import AnnotationsList from "./components/AnnotationsList";
import SidebarContainer from "../../components/SidebarContainer";
import ProjectsList from "./components/ProjectsList";
import { enhancedApi, useCreateProjectMutation } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";
import LabelsList from "./components/LabelsList";
import DefaultDialog from "../../components/DefaultDialog";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const activeTool = useAppSelector(selectActiveTool);
  const [getRandom] = enhancedApi.useLazyGetRandomObjectQuery();
  const { projectId, objectId } = useParams();

  const [showProjects, setShowProjects] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [projectName, setProjectName] = useState("");

  const [requestCreateProject, { isLoading: createLoading }] =
    useCreateProjectMutation();

  const selectProject = async (project: Project) => {
    if (project.id === projectId) return;

    // TODO: this should maybe move somewhere else
    document.title = `CREST - ${project.name}`;

    // another project was selected, start with random object
    const random = await getRandom({ projectId: project.id }).unwrap();
    navigate(`/annotate/${project.id}/${random.id}`);
  };

  const createProject = async () => {
    const project = await requestCreateProject({
      shallowProject: { name: projectName },
    }).unwrap();

    // TODO: redirect to project
    navigate(`/annotate/${project.id}`);
  };

  const showCreateDialog = async () => {
    setShowProjects(false);
    setShowCreate(true);
  };

  const renderTools = () => (
    <ToolbarButtonGroup
      exclusive
      value={activeTool}
      onChange={(_, value) => dispatch(setActiveTool(value))}
    >
      {[
        { tool: Tool.Pen, icon: PenIcon },
        { tool: Tool.Rectangle, icon: RectangleIcon },
        { tool: Tool.Circle, icon: CircleIcon },
      ].map((button) => {
        return (
          <ToggleButton value={button.tool} key={button.tool}>
            {<button.icon />}
          </ToggleButton>
        );
      })}
    </ToolbarButtonGroup>
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
            <AnnotationsList />
          </SidebarContainer>
          <SidebarContainer title="Labels">
            <LabelsList projectId={projectId} />
          </SidebarContainer>
        </Stack>
      }
    >
      <DefaultDialog
        onClose={() => setShowCreate(false)}
        open={showCreate}
        maxWidth="sm"
        fullWidth={true}
        title="Create Project"
      >
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            variant="standard"
            label="Project Title"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreate(false)} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            onClick={createProject}
            disabled={createLoading || !projectName}
          >
            Add
          </Button>
        </DialogActions>
      </DefaultDialog>
      <DefaultDialog
        onClose={() => setShowProjects(false)}
        open={!showCreate && (!projectId || showProjects)}
        maxWidth="sm"
        fullWidth={true}
        title="Select Project"
      >
        <ProjectsList
          selectProject={selectProject}
          addProject={showCreateDialog}
        />
      </DefaultDialog>
      <Canvas
        imageUri={
          objectId &&
          `${
            global.config?.REACT_APP_BACKEND || process.env.REACT_APP_BACKEND
          }/objects/image/${objectId}`
        }
      />
    </Layout>
  );
};

export default AnnotatePage;
