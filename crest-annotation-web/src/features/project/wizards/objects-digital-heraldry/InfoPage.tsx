import React from "react";
import { Button, Divider, Stack } from "@mui/material";
import { useImportIiif3Mutation } from "../../../../api/enhancedApi";
import { DigitalHeraldryImport, Project } from "../../../../api/openApi";
import Layout from "../../components/Layout";
import ProblemsList from "../../components/wizards/ProblemsList";

interface IProps {
  project: Project;
  source: string;
  data: DigitalHeraldryImport;
  onCancel: () => void;
  onProceed: () => void;
}

const InfoPage = ({ project, source, data, onCancel, onProceed }: IProps) => {
  const [importRequest, importQuery] = useImportIiif3Mutation();

  // fetch import info
  const executeImport = async () => {
    if (!source) return;

    await importRequest({
      projectId: project.id,
      url: source,
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
          Import {data.added.length} objects
        </Button>
      }
    >
      <Stack padding={2} spacing={1}>
        <ul>
          <li>Total objects: {data.objects.length}</li>
          <li>New objects: {data.added.length}</li>
        </ul>
      </Stack>

      {data.problems && !!data.problems.length && (
        <>
          <Divider />
          <ProblemsList
            title="Manifest contains problems"
            problems={data.problems}
          />
        </>
      )}
    </Layout>
  );
};

export default InfoPage;
