import React, { useState } from "react";
import {
  Button,
  Divider,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import Layout from "./Layout";
import { useUpdateProjectMutation } from "../../../api/enhancedApi";
import { Project } from "../../../api/openApi";
import DigitalHeraldry from "../synchronizations/digital-heraldry";

const synchronizations = {
  "digital-heraldry": DigitalHeraldry,
} as const;

type Synchronization = keyof typeof synchronizations;

interface IProps {
  project: Project;
}

const getConfig = (synchronization?: string) =>
  synchronization && synchronization in synchronizations
    ? synchronizations[synchronization as Synchronization]
    : undefined;

const AnnotationsTab = ({ project }: IProps) => {
  const [updateRequest, { isLoading: updateLoading }] =
    useUpdateProjectMutation();

  const [changed, setChanged] = useState<Project>();

  const handleSave = async (current: Project) => {
    try {
      await updateRequest({ patchProject: current }).unwrap();
      // clear changes to show updates
      setChanged(undefined);
    } catch {
      // TODO: error message
    }
  };

  const current = changed ?? project;
  const option = current.sync_type || "default";
  const loading = updateLoading;

  // retrieve the configuration component
  const config = getConfig(current.sync_type);
  const Config = config?.component;

  return (
    <Layout
      customActions={
        <Button
          onClick={() => handleSave(current)}
          disabled={!changed || loading}
          variant="contained"
        >
          Save changes
        </Button>
      }
    >
      <Stack padding={2} spacing={1}>
        <TextField
          select
          fullWidth
          variant="filled"
          label="Backend"
          value={option}
          onChange={(e) =>
            setChanged({
              ...current,
              // implicitly reset the config
              sync_type: e.target.value,
              sync_config: undefined,
            })
          }
        >
          <MenuItem value="default">Default</MenuItem>
          {Object.entries(synchronizations).map(([id, { name }]) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        {option === "default" && (
          <FormHelperText>
            Synchronize annotations with the default backend database.
          </FormHelperText>
        )}
        {config?.description && (
          <FormHelperText>{config.description}</FormHelperText>
        )}
      </Stack>
      <Divider />
      {Config && (
        <Config
          project={project}
          onChange={(config) =>
            setChanged({
              ...current,
              sync_config: config,
            })
          }
        />
      )}
    </Layout>
  );
};

export default AnnotationsTab;
