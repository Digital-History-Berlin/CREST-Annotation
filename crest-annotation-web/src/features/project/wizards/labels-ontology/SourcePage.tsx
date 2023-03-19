import React, { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import StartIcon from "@mui/icons-material/Download";
import { useGetOntologyImportMutation } from "../../../../api/enhancedApi";
import { Ontology } from "../../../../api/openApi";
import Layout from "../../components/Layout";

interface IProps {
  onCancel: () => void;
  onProceed: (source: string, ontology: Ontology) => void;
}

const SourcePage = ({ onCancel, onProceed }: IProps) => {
  const [source, setSource] = useState<string>();

  const [importRequest, importQuery] = useGetOntologyImportMutation();

  // fetch import info
  const startImport = async () => {
    if (!source) return;

    const ontology = await importRequest({ url: source }).unwrap();
    // continue with next step
    onProceed(source, ontology);
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
        <Typography variant="h4">Import Ontology</Typography>
        <TextField
          label="Link to Ontology"
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
