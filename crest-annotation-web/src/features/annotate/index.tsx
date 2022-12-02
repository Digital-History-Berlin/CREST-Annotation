import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectActiveTool, setActiveTool, Tool } from "./slice";
import {
  Dialog,
  DialogTitle,
  Stack,
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
import { enhancedApi } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";
import LabelsList from "./components/LabelsList";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const activeTool = useAppSelector(selectActiveTool);
  const [getRandom] = enhancedApi.useLazyGetRandomObjectQuery();
  const { projectId, objectId } = useParams();

  const [showProjects, setShowProjects] = useState(false);

  const handleSelectProject = async (project: Project) => {
    if (project.id === projectId) return;

    // TODO: this should maybe move somewhere else
    document.title = `CREST - ${project.name}`;

    // another project was selected, start with random object
    const random = await getRandom({ projectId: project.id }).unwrap();
    navigate(`/annotate/${project.id}/${random.id}`);
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
      <Dialog
        onClose={() => setShowProjects(false)}
        open={!projectId || showProjects}
        maxWidth="sm"
        fullWidth={true}
      >
        <div
          style={{
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <h4>Select Project</h4>
        </div>
        <ProjectsList selectProject={handleSelectProject} />
      </Dialog>
      <Canvas
        imageUri={
          objectId &&
          `${process.env.REACT_APP_BACKEND}/objects/image/${objectId}`
        }
      />
    </Layout>
  );
};

export default AnnotatePage;
