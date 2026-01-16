import React, { Suspense, lazy, useEffect, useState } from "react";
import { Box, Divider, LinearProgress, Stack, TextField } from "@mui/material";
import { defaultPullQuery } from "./queries";
import { Project } from "../../../../api/openApi";

interface SyncConfig {
  endpoint: string;
  pull_query: string;
}

const defaultConfig: SyncConfig = {
  endpoint: "http://localhost:8889/blazegraph/namespace/kb/sparql",
  pull_query: defaultPullQuery,
};

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

export interface SyncConfigProps {
  project: Project;
  onChange: (config: string) => void;
}

const DigitalHeraldryConfig = ({ project, onChange }: SyncConfigProps) => {
  const [config, setConfig] = useState<SyncConfig>();

  useEffect(
    () => {
      if (!project.sync_config) onChange(JSON.stringify(defaultConfig));
      else setConfig(JSON.parse(project.sync_config));
    },
    // update internal state only when project changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project]
  );

  const handleChange = (change: Partial<SyncConfig>) =>
    onChange(JSON.stringify({ ...config, ...change }));

  return (
    <>
      <Stack padding={2} spacing={1}>
        <TextField
          label="SPARQL endpoint"
          variant="filled"
          value={config?.endpoint || ""}
          onChange={(e) => handleChange({ endpoint: e.target.value })}
          placeholder="http://localhost:8889/sparql"
        />
      </Stack>
      <Divider />
      <Box padding={2}>
        {/* TODO: provide actual fields from backend */}
        Provide a custom SPARQL query to pull annotations. Bindings from the
        wizard are injected into the script along with custom project fields.
        The following fields should be used to identify the object:
        <ul>
          <li style={{ fontFamily: "monospace" }}>manifestIRI</li>
          <li style={{ fontFamily: "monospace" }}>imageURL</li>
        </ul>
        The resulting annotations should provide the following bindings:
        <ul>
          <li style={{ fontFamily: "monospace" }}>annotationImageFile</li>
          <li style={{ fontFamily: "monospace" }}>blazon</li>
          <li style={{ fontFamily: "monospace" }}>blazonType</li>
          <li style={{ fontFamily: "monospace" }}>blazonTextAnnotation</li>
        </ul>
      </Box>
      <Suspense fallback={<LinearProgress />}>
        <MonacoEditor
          theme="vs-dark"
          language="sparql"
          value={config?.pull_query || ""}
          onChange={(value) => handleChange({ pull_query: value })}
          height="400px"
        />
      </Suspense>
    </>
  );
};

const synchronization = {
  component: DigitalHeraldryConfig,
  name: "Digital Heraldry",
  description:
    "Synchronize Annotations with the Digital Heraldry Ontology via SPARQL.",
};

export default synchronization;
