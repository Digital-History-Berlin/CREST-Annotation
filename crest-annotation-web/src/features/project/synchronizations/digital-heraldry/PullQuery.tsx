import { Suspense, lazy } from "react";
import { Box, LinearProgress, Stack } from "@mui/material";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface IProps {
  query?: string;
  onChange: (query?: string) => void;
}

const PushQuery = ({ query, onChange }: IProps) => {
  return (
    <Stack>
      <Box padding={2}>
        {/* TODO: provide actual fields from backend */}
        Provide a custom SPARQL query to pull annotations. Bindings from the
        wizard are injected into the script along with custom project fields.
        The following fields should be used to identify the object:
        <ul>
          <li style={{ fontFamily: "monospace" }}>manifestIRI</li>
          <li style={{ fontFamily: "monospace" }}>manuscriptFolioIRI</li>
        </ul>
        The resulting annotations should provide the following bindings:
        <ul>
          <li style={{ fontFamily: "monospace" }}>annotationImageFile</li>
          <li style={{ fontFamily: "monospace" }}>blazonActIRI</li>
          <li style={{ fontFamily: "monospace" }}>blazonIRI</li>
          <li style={{ fontFamily: "monospace" }}>blazonTypeIRI</li>
        </ul>
      </Box>
      <Suspense fallback={<LinearProgress />}>
        <MonacoEditor
          theme="vs-dark"
          language="sparql"
          value={query || ""}
          onChange={onChange}
          height="400px"
        />
      </Suspense>
    </Stack>
  );
};

export default PushQuery;
