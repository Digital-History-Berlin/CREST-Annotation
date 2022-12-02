import React from "react";
import {
  Container,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useGetProjectsQuery } from "../../../api/enhancedApi";
import { Project } from "../../../api/openApi";

interface IProps {
  selectProject: (project: Project) => void;
}

const defaultProps = {};

const ProjectsList = ({ selectProject }: IProps) => {
  const theme = useTheme();

  const { data: projects, isLoading, isError } = useGetProjectsQuery();

  if (isLoading)
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: theme.spacing(3),
        }}
      >
        <CircularProgress />
      </Container>
    );

  if (projects === undefined || isError)
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: theme.spacing(3),
        }}
      >
        Failed to load projects
      </Container>
    );

  return (
    <List>
      {projects.map((project) => (
        <ListItemButton key={project.id} onClick={() => selectProject(project)}>
          <ListItemText primary={project.name ?? "Unnamed"} />
        </ListItemButton>
      ))}
    </List>
  );
};

ProjectsList.defaultProps = defaultProps;

export default ProjectsList;
