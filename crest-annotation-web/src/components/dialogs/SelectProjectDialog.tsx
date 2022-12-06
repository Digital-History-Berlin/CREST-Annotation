import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetProjectsQuery } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";
import Loader from "../Loader";
import DefaultDialog from "./DefaultDialog";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface IProps {
  activeProjectId?: string;
  open: boolean;
  onClose: () => void;
  onCreate?: () => void;
}

const SelectProjectDialog = ({
  activeProjectId,
  open,
  onClose,
  onCreate,
}: IProps) => {
  const navigate = useNavigate();

  const selectProject = (project: Project) => {
    if (project.id === activeProjectId) return;

    // another project was selected, start with random object
    navigate(`/annotate/${project.id}`);
  };

  return (
    <DefaultDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth={true}
      title="Select Project"
    >
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
            {onCreate && (
              <ListItem disablePadding>
                <ListItemButton onClick={onCreate}>
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
    </DefaultDialog>
  );
};

export default SelectProjectDialog;
