import React from "react";
import { Button, DialogActions, DialogTitle } from "@mui/material";
import DefaultDialog from "./DefaultDialog";
import { useDeleteProjectMutation } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";

interface IProps {
  project?: Project;
  onClose: () => void;
}
const DeleteProjectDialog = ({ project, onClose }: IProps) => {
  const [requestDeleteProject, { isLoading: createLoading }] =
    useDeleteProjectMutation();

  const deleteProject = () => {
    if (project)
      requestDeleteProject({ projectId: project.id }).unwrap().then(onClose);
  };

  return (
    <DefaultDialog
      onClose={onClose}
      open={!!project}
      maxWidth="sm"
      fullWidth={true}
      title="Delete Project"
    >
      <DialogTitle>Are you sure you want to delete this project?</DialogTitle>
      <DialogActions>
        <Button onClick={onClose} disabled={createLoading}>
          Cancel
        </Button>
        <Button onClick={deleteProject} disabled={createLoading}>
          Yes
        </Button>
      </DialogActions>
    </DefaultDialog>
  );
};

export default DeleteProjectDialog;
