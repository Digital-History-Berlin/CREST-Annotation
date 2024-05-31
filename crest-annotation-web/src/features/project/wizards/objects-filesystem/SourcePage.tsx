import React, { useState } from "react";
import {
  Alert,
  Button,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import StartIcon from "@mui/icons-material/Download";
import {
  FilesystemImport,
  Project,
  useImportFilesystemMutation,
} from "../../../../api/openApi";
import Layout from "../../components/Layout";

interface IProps {
  project: Project;
  onCancel: () => void;
  onProceed: (source: string, data: FilesystemImport) => void;
}

const SourcePage = ({ project, onCancel, onProceed }: IProps) => {
  const [path, setPath] = useState<string>();

  const [importRequest, importQuery] = useImportFilesystemMutation();

  // fetch import info
  const startImport = async () => {
    if (!path) return;

    const data = await importRequest({
      projectId: project.id,
      path: path,
      commit: false,
    }).unwrap();
    // continue with next step
    onProceed(path, data);
  };

  return (
    <Layout
      onCancel={onCancel}
      customActions={
        <Button
          startIcon={<StartIcon />}
          onClick={startImport}
          variant="contained"
          disabled={!path?.trim().length || importQuery.isLoading}
        >
          Import
        </Button>
      }
    >
      <Stack padding={2} spacing={1}>
        <Typography variant="h4">Import from filesystem</Typography>
        {importQuery.error && (
          <Alert severity="error">
            An error occured. Check the console for details.
          </Alert>
        )}
        <TextField
          label="Path"
          variant="filled"
          value={path ?? ""}
          onChange={(e) => setPath(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormHelperText>
          Provide an absolute path or a path relative to the root folder of the
          backend.
        </FormHelperText>
      </Stack>
    </Layout>
  );
};

export default SourcePage;
