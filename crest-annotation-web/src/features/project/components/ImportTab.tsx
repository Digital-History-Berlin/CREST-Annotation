import React, { useState } from "react";
import { Project } from "../../../api/openApi";
import {
  enhancedApi,
  useImportOntologyMutation,
} from "../../../api/enhancedApi";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import StartIcon from "@mui/icons-material/Download";
import Loader from "../../../components/Loader";
import DefaultDialog from "../../../components/dialogs/DefaultDialog";
import ImportOntology from "./ImportOntology";

interface IProps {
  project: Project;
  onSuccess: () => void;
}

const ImportTab = ({ project, onSuccess }: IProps) => {
  const [source, setSource] = useState<string>();
  const [activeSource, setActiveSource] = useState<string>();
  const [pending, setPending] = useState<string[]>();

  const [importRequest, importQuery] =
    enhancedApi.useLazyGetOntologyImportQuery();
  const [importMutation, { isLoading: importLoading }] =
    useImportOntologyMutation();

  // fetch import info
  const startImport = async () => {
    if (!source) return;

    await importRequest({ url: source }).unwrap();
    // enable ontology import
    setActiveSource(source);
  };

  // execute actual import
  const executeImport = async (itemIds: string[], method: string) => {
    if (!source) return;

    const response = await importMutation({
      url: source,
      projectId: project.id,
      body: itemIds,
      method: method,
    }).unwrap();

    if (response.result === "conflict") setPending(itemIds);
    if (response.result === "success") {
      setSource(undefined);
      setActiveSource(undefined);
      setPending(undefined);

      // TODO: done message
      onSuccess();
    }
  };

  // continue pending import
  const continueImport = (method: string) => {
    if (pending) executeImport(pending, "override");
  };

  return (
    <Stack>
      <DefaultDialog
        open={!!pending}
        onClose={() => setPending(undefined)}
        title="Project contains labels"
      >
        <DialogContent>
          <DialogContentText>
            This project already contains labels. It is currently not possible
            to merge existing labels during an import. Please remove all labels
            manually before proceeding.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(undefined)}>Cancel</Button>
          <Box flexGrow={1} />
          <Button onClick={() => continueImport("override")} variant="outlined">
            Override
          </Button>
          <Button disabled={true} variant="outlined">
            Merge
          </Button>
        </DialogActions>
      </DefaultDialog>

      <Stack padding={2} spacing={2} direction="row">
        <TextField
          label="Link to Ontology"
          variant="filled"
          value={source ?? ""}
          onChange={(e) => setSource(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button
          onClick={startImport}
          variant="contained"
          disabled={importQuery.isFetching}
        >
          <StartIcon />
        </Button>
      </Stack>
      <Divider />

      <Loader
        loadOnFetch={true}
        query={{ ...importQuery, isDisabled: !activeSource }}
        disabledPlaceholder="No ontology data available"
        render={({ data: ontology }) => (
          <ImportOntology
            key={activeSource}
            project={project}
            ontology={ontology}
            onImport={executeImport}
            onSuccess={onSuccess}
          />
        )}
      />
    </Stack>
  );
};

export default ImportTab;
