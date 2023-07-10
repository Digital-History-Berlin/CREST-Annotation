import { Button, Stack, Typography } from "@mui/material";
import { Project } from "../../../../api/openApi";
import { baseUrl } from "../../../../api/rootApi";
import Layout from "../../components/Layout";

interface IProps {
  project: Project;
  onCancel: () => void;
  onProceed: () => void;
}

const InfoPage = ({ project, onCancel, onProceed }: IProps) => {
  const handleDownload = () => {
    window.open(`${baseUrl}/export/yaml?project_id=${project.id}`, "_blank");
    onProceed();
  };

  return (
    <Layout
      customActions={
        <Button variant="contained" onClick={handleDownload}>
          Download
        </Button>
      }
      onCancel={onCancel}
    >
      <Stack padding={2} spacing={1}>
        <Typography variant="body1">
          The project data will be exported to plain YAML file.
        </Typography>
      </Stack>
    </Layout>
  );
};

export default InfoPage;
