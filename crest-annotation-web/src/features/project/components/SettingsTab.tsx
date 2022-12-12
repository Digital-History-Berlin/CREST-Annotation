import React, { useState } from "react";
import { Project } from "../../../api/openApi";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import DefaultDialog from "../../../components/dialogs/DefaultDialog";
import {
  useCollectObjectsMutation,
  useUpdateProjectMutation,
} from "../../../api/enhancedApi";

interface IProps {
  project: Project;
}

const SettingsTab = ({ project }: IProps) => {
  const [collectRequest, { isLoading: collectLoading }] =
    useCollectObjectsMutation();
  const [updateRequest, { isLoading: updateLoading }] =
    useUpdateProjectMutation();

  const [showCollect, setShowCollect] = useState(false);
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

  const collectObjects = async () => {
    setShowCollect(false);

    if (project.id) {
      try {
        const result = await collectRequest({ projectId: project.id }).unwrap();
        // TODO: show progress and handle result
      } catch (e) {
        // TODO: improve error messages
        if (e instanceof Error) {
        } else {
        }
      }
    }
  };

  const current = changed ?? project;
  const loading = collectLoading || updateLoading;

  return (
    <>
      <DefaultDialog
        open={showCollect}
        onClose={() => setShowCollect(false)}
        title="Collect objects"
      >
        <DialogContent>
          <DialogContentText>
            This will search the project source for new objects and add them to
            the project database. Existing objects and annotations will be kept.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCollect(false)}>Cancel</Button>
          <Button onClick={collectObjects} variant="outlined">
            Continue
          </Button>
        </DialogActions>
      </DefaultDialog>

      <Stack padding={2} spacing={2}>
        <TextField
          label="Project Name"
          variant="filled"
          value={current.name}
          onChange={(e) => setChanged({ ...current, name: e.target.value })}
        />
        <TextField
          label="Source"
          variant="filled"
          value={current.source}
          onChange={(e) => setChanged({ ...current, source: e.target.value })}
        />
      </Stack>
      <Divider />

      <Stack direction="row" spacing={1} padding={2} justifyContent="flex-end">
        <Button
          onClick={() => setShowCollect(true)}
          disabled={loading}
          variant="outlined"
        >
          Collect objects
        </Button>
        <Button
          onClick={() => save(current)}
          disabled={!changed || loading}
          variant="contained"
        >
          Save changes
        </Button>
      </Stack>
    </>
  );
};

export default SettingsTab;
