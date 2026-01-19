import React, { Suspense, lazy, useState } from "react";
import { PlayArrow } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { defaultQuery } from "./queries";
import { useImportDigitalHeraldryMutation } from "../../../../api/enhancedApi";
import { DigitalHeraldryImport, Project } from "../../../../api/openApi";
import { errorMessage } from "../../../../utils/error-message";
import Layout from "../../components/Layout";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface IProps {
  project: Project;
  onCancel: () => void;
  onProceed: (
    source: string,
    query: string,
    data: DigitalHeraldryImport
  ) => void;
}

const SourcePage = ({ project, onCancel, onProceed }: IProps) => {
  const [source, setSource] = useState<string>();
  const [query, setQuery] = useState<string | undefined>(defaultQuery);

  const [importRequest, importQuery] = useImportDigitalHeraldryMutation();

  // fetch import info
  const startImport = async () => {
    if (!source || !query) return;

    const data = await importRequest({
      projectId: project.id,
      endpoint: source,
      commit: false,
      bodyImportDigitalHeraldryImportDigitalHeraldryPost: {
        query,
      },
    }).unwrap();
    // continue with next step
    onProceed(source, query, data);
  };

  return (
    <Layout
      onCancel={onCancel}
      customActions={
        <Button
          startIcon={<PlayArrow />}
          onClick={startImport}
          variant="contained"
          disabled={
            !source?.trim().length ||
            !query?.trim().length ||
            importQuery.isLoading
          }
        >
          Execute query
        </Button>
      }
    >
      <Stack padding={2} spacing={1}>
        {importQuery.error && (
          <Alert severity="error">{errorMessage(importQuery.error)}</Alert>
        )}
        <Typography variant="h4">
          Import from the Digital Heraldry Ontology
        </Typography>
        <TextField
          label="SPARQL endpoint"
          variant="filled"
          value={source ?? ""}
          onChange={(e) => setSource(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Stack>
      <Divider />
      <Box padding={2}>
        {/* TODO: provide actual fields from backend */}
        Provide a custom SPARQL query to filter the objects to import. Custom
        project fields are injected into the script. The resulting objects
        should provide the following bindings:
        <ul>
          <li style={{ fontFamily: "monospace" }}>manuscriptFolio</li>
          <li style={{ fontFamily: "monospace" }}>folioImageFileURL</li>
        </ul>
        Additional bindings will be stored alongside each object and can be used
        in the synchronization script.
      </Box>
      <Suspense fallback={<LinearProgress />}>
        <MonacoEditor
          theme="vs-dark"
          language="sparql"
          value={query}
          onChange={setQuery}
          height="400px"
        />
      </Suspense>
    </Layout>
  );
};

export default SourcePage;
