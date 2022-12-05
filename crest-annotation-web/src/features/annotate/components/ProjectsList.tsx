import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useGetProjectsQuery } from "../../../api/enhancedApi";
import { Project } from "../../../api/openApi";
import Loader from "../../../components/Loader";

interface IProps {
  selectProject?: (project: Project) => void;
  addProject?: () => void;
}

const defaultProps = {};

const ProjectsList = ({ selectProject, addProject }: IProps) => {
  return (
    <Loader
      emptyPlaceholder={"Start by creating your first project!"}
      query={useGetProjectsQuery()}
      render={({ data: projects }) => (
        <List>
          {projects.map((project) => (
            <ListItem disablePadding key={project.id}>
              <ListItemButton
                onClick={selectProject && (() => selectProject(project))}
              >
                <ListItemText primary={project.name ?? "Unnamed"} />
              </ListItemButton>
            </ListItem>
          ))}
          {addProject && (
            <ListItem disablePadding>
              <ListItemButton onClick={addProject}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={"Add Project"} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      )}
    />
  );
};

ProjectsList.defaultProps = defaultProps;

export default ProjectsList;
