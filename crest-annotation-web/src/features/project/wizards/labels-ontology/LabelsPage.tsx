import React, { useState } from "react";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { useImportOntologyMutation } from "../../../../api/enhancedApi";
import { Ontology, Project } from "../../../../api/openApi";
import Layout from "../../components/Layout";
import LabelSelect from "../../components/wizards/LabelSelect";
import MergeLabelsDialog from "../../components/wizards/MergeLabelsDialog";

interface IProps {
  project: Project;
  source: string;
  ontology: Ontology;
  onCancel: () => void;
  onProceed: () => void;
}

const LabelsPage = ({
  project,
  source,
  ontology,
  onCancel,
  onProceed,
}: IProps) => {
  const [leafs, setLeafs] = useState<string[]>([]);
  const [nodes, setNodes] = useState<string[]>([]);
  const [pending, setPending] = useState<boolean>(false);

  const [importMutation, { isLoading: importLoading }] =
    useImportOntologyMutation();

  // execute actual import
  const executeImport = async (method: string) => {
    if (!source) return;

    const response = await importMutation({
      url: source,
      projectId: project.id,
      // remove possible duplicates from selection
      body: nodes,
      method: method,
    }).unwrap();

    if (response.result === "conflict") setPending(true);
    if (response.result === "success") {
      setPending(false);
      onProceed();
    }
  };

  // continue pending import
  const continueImport = (method: string) => {
    if (pending) executeImport(method);
  };

  return (
    <Layout
      onCancel={onCancel}
      customActions={
        <Button
          onClick={() => executeImport("none")}
          disabled={nodes.length === 0 || importLoading}
          variant="outlined"
        >
          Import {nodes.length} labels
        </Button>
      }
    >
      <MergeLabelsDialog
        open={pending}
        disabled={importLoading}
        onClose={() => setPending(false)}
        onConfirm={continueImport}
      />

      <Stack padding={2} spacing={1}>
        <Typography variant="h4">{ontology.titles?.at(0)}</Typography>
        <Typography variant="body1">
          Select labels for import and proceed.
        </Typography>
      </Stack>
      <Divider />

      <LabelSelect
        labels={ontology.labels}
        selected={leafs}
        setSelected={(leafs, flat) => {
          // selected leafs only
          setLeafs(leafs);
          // selected leafs and nodes
          setNodes(flat);
        }}
      />
    </Layout>
  );
};

export default LabelsPage;
