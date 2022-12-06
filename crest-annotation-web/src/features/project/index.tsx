import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Link,
  Button,
  Container,
  DialogActions,
  DialogContent,
  DialogContentText,
  Stack,
  TextField,
} from "@mui/material";
import Layout from "../../components/layouts/Layout";
import Toolbar from "../../components/Toolbar";
import {
  useCollectObjectsMutation,
  useGetProjectQuery,
  useUpdateProjectMutation,
} from "../../api/enhancedApi";
import Loader from "../../components/Loader";
import DefaultDialog from "../../components/dialogs/DefaultDialog";
import { Project } from "../../api/openApi";

const AnnotatePage = () => {
  const { projectId } = useParams();

  const [collectRequest, { isLoading: collectLoading }] =
    useCollectObjectsMutation();
  const [updateRequest, { isLoading: updateLoading }] =
    useUpdateProjectMutation();

  const projectQuery = useGetProjectQuery(
    { projectId: projectId! },
    { skip: !projectId }
  );

  const [showCollect, setShowCollect] = useState(false);
  // used for intermediate updates
  // TODO: optimistic update mechanism in enhancedApi
  const [updated, setUpdated] = useState<Project>();
  // contains actual changes
  const [changed, setChanged] = useState<Project>();

  const save = async (current: Project) => {
    try {
      const project = await updateRequest({ shallowProject: current }).unwrap();

      setUpdated(project);
      setChanged(undefined);
    } catch {
      // TODO: error message
    }
  };

  useEffect(() => {
    // override intermediate udpate data with actual data
    setUpdated(undefined);
  }, [projectQuery.data]);

  const collectObjects = async () => {
    setShowCollect(false);

    if (projectId) {
      // TODO: show progress and handle result
      await collectRequest({ projectId }).unwrap();
    }
  };

  const renderForm = (original: Project) => {
    const current = changed ?? original;
    const loading = projectQuery.isFetching || updateLoading || collectLoading;

    return (
      <Stack spacing={2}>
        <div>TODO: project information and status</div>
        <TextField
          label="Project Name"
          variant="standard"
          value={current.name}
          onChange={(e) => setChanged({ ...current, name: e.target.value })}
        />
        <TextField
          label="Source"
          variant="standard"
          value={current.source}
          onChange={(e) => setChanged({ ...current, source: e.target.value })}
        />
        <div>
          <Link href={`/objects/${original.id}`}>Link to project objects</Link>
        </div>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
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
      </Stack>
    );
  };

  return (
    <Layout
      header={<Toolbar title={projectQuery.data?.name ?? "Project Settings"} />}
    >
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
      <Loader
        query={{ ...projectQuery, data: updated ?? projectQuery.data }}
        render={({ data: project }) => (
          <Container maxWidth="sm">{renderForm(project)}</Container>
        )}
      />
    </Layout>
  );
};

export default AnnotatePage;
