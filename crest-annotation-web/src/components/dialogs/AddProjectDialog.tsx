import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, DialogActions, DialogContent, TextField } from "@mui/material";
import DefaultDialog from "./DefaultDialog";
import { useCreateProjectMutation } from "../../api/enhancedApi";

interface IProps {
  open: boolean;
  onClose: () => void;
}

const AddProjectDialog = ({ open, onClose }: IProps) => {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");

  const [requestCreateProject, { isLoading: createLoading }] =
    useCreateProjectMutation();

  const createProject = async () => {
    const project = await requestCreateProject({
      shallowProject: { name: projectName },
    }).unwrap();

    // redirect to project overview
    navigate(`/objects/${project.id}`);
  };

  return (
    <DefaultDialog
      onClose={onClose}
      open={open}
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
        <Button onClick={onClose} disabled={createLoading}>
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
  );
};

export default AddProjectDialog;
