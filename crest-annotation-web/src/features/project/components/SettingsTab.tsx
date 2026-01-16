import React, { useState } from "react";
import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
  const loading = updateLoading;
  const fields = current.custom_fields ?? {};
  const entries = Object.entries(fields);

  // custom field change handlers
  const setFields = (fields: Record<string, string>) =>
    setChanged({ ...current, custom_fields: fields });
  const handleFieldAdd = () =>
    setFields({ ...fields, [`field${entries.length + 1}`]: "" });
  const handleFieldRemove = (key: string) =>
    setFields(
      Object.fromEntries(
        Object.entries(fields).filter(([entry]) => entry !== key)
      )
    );
  const handleFieldKey = (current: string, update: string) =>
    setFields(
      Object.fromEntries(
        Object.entries(fields).map(([key, value]) =>
          key === current ? [update, value] : [key, value]
        )
      )
    );
  const handleFieldValue = (key: string, value: string) =>
    setFields({ ...fields, [key]: value });

  return (
    <Layout
      customActions={
        <>
          <Button startIcon={<Add />} onClick={handleFieldAdd} size="small">
            Add Field
          </Button>
          <Box flexGrow={1} />
          <Button
            onClick={() => handleSave(current)}
            disabled={!changed || loading}
            variant="contained"
          >
            Save changes
          </Button>
        </>
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
      <Divider />
      <Stack padding={2} spacing={1}>
        <Typography variant="body1">Custom Fields</Typography>
        <Typography variant="body2" color="text.secondary">
          Define custom key-value pairs for this project. These can be used by
          wizards and during annotation synchronization. The exact usage depends
          on the service itself.
        </Typography>

        {entries.map(([key, value], i) => (
          // IMPORTANT: do not use key as key (it can be changed by user)
          <Stack key={i} direction="row" spacing={1} alignItems="center">
            <TextField
              label="Key"
              size="small"
              variant="filled"
              value={key}
              onChange={(e) => handleFieldKey(key, e.target.value)}
              fullWidth
            />
            <TextField
              label="Value"
              size="small"
              variant="filled"
              value={value}
              onChange={(e) => handleFieldValue(key, e.target.value)}
              fullWidth
            />
            <IconButton size="small" onClick={() => handleFieldRemove(key)}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Layout>
  );
};

export default SettingsTab;
