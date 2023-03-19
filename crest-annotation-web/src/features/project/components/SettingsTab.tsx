import React, { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import Layout from "./Layout";
import { useUpdateProjectMutation } from "../../../api/enhancedApi";
import { Project } from "../../../api/openApi";

interface IProps {
  project: Project;
}

const SettingsTab = ({ project }: IProps) => {
  const [updateRequest, { isLoading: updateLoading }] =
    useUpdateProjectMutation();

  const [changed, setChanged] = useState<Project>();

  const save = async (current: Project) => {
    try {
      await updateRequest({ shallowProject: current }).unwrap();
      // clear changes to show updates
      setChanged(undefined);
    } catch {
      // TODO: error message
    }
  };

  const current = changed ?? project;
  const loading = updateLoading;

  return (
    <Layout
      customActions={
        <Button
          onClick={() => save(current)}
          disabled={!changed || loading}
          variant="contained"
        >
          Save changes
        </Button>
      }
    >
      <Stack padding={2} spacing={2}>
        <TextField
          label="Project Name"
          variant="filled"
          value={current.name}
          onChange={(e) => setChanged({ ...current, name: e.target.value })}
        />
      </Stack>
    </Layout>
  );
};

export default SettingsTab;
