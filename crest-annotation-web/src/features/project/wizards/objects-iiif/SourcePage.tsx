import React, { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import StartIcon from "@mui/icons-material/Download";
import { useImportIiif3Mutation } from "../../../../api/enhancedApi";
import { Iiif3Import, Project } from "../../../../api/openApi";
import Layout from "../../components/Layout";

interface IProps {
  project: Project;
  onCancel: () => void;
  onProceed: (source: string, data: Iiif3Import) => void;
}

const SourcePage = ({ project, onCancel, onProceed }: IProps) => {
  const [source, setSource] = useState<string>();

  const [importRequest, importQuery] = useImportIiif3Mutation();

  // fetch import info
  const startImport = async () => {
    if (!source) return;

    const data = await importRequest({
      projectId: project.id,
      url: source,
      commit: false,
    }).unwrap();
    // continue with next step
    onProceed(source, data);
  };

  return (
    <Layout
      onCancel={onCancel}
      customActions={
        <Button
          startIcon={<StartIcon />}
          onClick={startImport}
          variant="contained"
          disabled={!source?.trim().length || importQuery.isLoading}
        >
          Download
        </Button>
      }
    >
      <Stack padding={2} spacing={1}>
        <Typography variant="h4">Import IIIF Manifest</Typography>
        <TextField
          label="Link to Manifest"
          variant="filled"
          value={source ?? ""}
          onChange={(e) => setSource(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Stack>
    </Layout>
  );
};

export default SourcePage;
