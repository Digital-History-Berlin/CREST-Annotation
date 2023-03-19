import React from "react";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { useImportIiif3Mutation } from "../../../../api/enhancedApi";
import { Iiif3Import, Project } from "../../../../api/openApi";
import Layout from "../../components/Layout";
import ProblemsList from "../../components/wizards/ProblemsList";

interface IProps {
  project: Project;
  source: string;
  data: Iiif3Import;
  onCancel: () => void;
  onProceed: () => void;
}

const InfoPage = ({ project, source, data, onCancel, onProceed }: IProps) => {
  const title = data.title?.["en"];

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
          Import {data.added.length} labels
        </Button>
      }
    >
      <Stack padding={2} spacing={1}>
        {title && <Typography variant="h4">{title}</Typography>}
        <Typography variant="body1">
          <ul>
            <li>Total images: {data.images.length}</li>
            <li>New images: {data.added.length}</li>
          </ul>
        </Typography>
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
