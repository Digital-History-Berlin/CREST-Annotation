import React, { useState } from "react";
import { Box, Container, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import LabelsTab from "./components/LabelsTab";
import SettingsTab from "./components/SettingsTab";
import WizardsTab from "./components/WizardsTab";
import { useGetProjectQuery } from "../../api/enhancedApi";
import Layout from "../../components/layouts/Layout";
import Loader from "../../components/Loader";
import Toolbar from "../../components/Toolbar";

const ProjectPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const projectQuery = useGetProjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );

  const [currentTab, setCurrentTab] = useState(0);

  const completeWizard = (group: string) => {
    if (group === "objects") navigate(`/objects/${projectId}`);
    if (group === "labels") setCurrentTab(1);
  };

  return (
    <Layout
      scrollable
      header={<Toolbar title={projectQuery.data?.name ?? "Project Settings"} />}
    >
      <Container maxWidth="sm">
        <Typography variant="h5" color="info">
          Project Settings
        </Typography>

        <Loader
          query={projectQuery}
          render={({ data: project }) => (
            <Paper>
              <Box mt={2} sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={currentTab}
                  onChange={(_, value) => setCurrentTab(value)}
                >
                  <Tab label="Settings" />
                  <Tab label="Labels" />
                  <Tab label="Import" />
                </Tabs>
              </Box>
              <Box hidden={currentTab !== 0}>
                <SettingsTab project={project} />
              </Box>
              <Box hidden={currentTab !== 1}>
                <LabelsTab project={project} />
              </Box>
              <Box hidden={currentTab !== 2}>
                <WizardsTab
                  project={project}
                  // show labels tab after successful import
                  onSuccess={completeWizard}
                />
              </Box>
            </Paper>
          )}
        />
      </Container>
    </Layout>
  );
};

export default ProjectPage;
