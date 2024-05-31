import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import {
  FilesystemImport,
  Project,
  useImportFilesystemMutation,
} from "../../../../api/openApi";
import Layout from "../../components/Layout";

interface IProps {
  project: Project;
  path: string;
  data: FilesystemImport;
  onCancel: () => void;
  onProceed: () => void;
}

const InfoPage = ({ project, path, data, onCancel, onProceed }: IProps) => {
  const [importRequest, importQuery] = useImportFilesystemMutation();

  // fetch import info
  const executeImport = async () => {
    if (!path) return;

    await importRequest({
      projectId: project.id,
      path: path,
      commit: true,
    }).unwrap();
    // continue with next step
    onProceed();
  };

  return (
    <Layout
      onCancel={onCancel}
      customActions={
        <Button
          onClick={() => executeImport()}
          disabled={data.added.length === 0 || importQuery.isLoading}
          variant="outlined"
        >
          Import {data.added.length} images
        </Button>
      }
    >
      <Stack padding={2} spacing={1}>
        <Typography variant="h4">Overview</Typography>
        <ul>
          <li>Path: {path}</li>
          <li>Total images: {data.objects.length}</li>
          <li>New images: {data.added.length}</li>
        </ul>
      </Stack>
    </Layout>
  );
};

export default InfoPage;
