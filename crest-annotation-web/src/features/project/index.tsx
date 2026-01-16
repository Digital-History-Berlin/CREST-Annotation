import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AnnotationsTab from "./components/AnnotationsTab";
import LabelsTab from "./components/LabelsTab";
import SettingsTab from "./components/SettingsTab";
import TasksTab from "./components/TasksTab";
import WizardsTab from "./components/WizardsTab";
import { useGetProjectQuery } from "../../api/enhancedApi";
import Layout from "../../components/layouts/Layout";
import Loader from "../../components/Loader";
import Toolbar from "../../components/Toolbar";
import ToolbarTabs from "../../components/ToolbarTabs";
import { withProject } from "../../hocs/with-project";

const ProjectPage = withProject(({ projectId }) => {
  const navigate = useNavigate();

  const projectQuery = useGetProjectQuery({ projectId });

  const [currentTab, setCurrentTab] = useState(0);

  const completeWizard = (group: string) => {
    if (group === "objects") navigate(`/objects/${projectId}`);
    if (group === "labels") setCurrentTab(1);
  };

  const renderActions = () => (
    <Stack direction="row">
      <ToolbarTabs active="settings" />
    </Stack>
  );

  return (
    <Layout
      scrollable
      header={
        <Toolbar
          title={projectQuery.data?.name ?? "Project Settings"}
          actions={renderActions()}
        />
      }
    >
      <Container maxWidth="md">
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
                  <Tab label="Annotations" />
                  <Tab label="Wizards" />
                  <Tab label="Tasks" />
                </Tabs>
              </Box>
              <Box hidden={currentTab !== 0}>
                <SettingsTab project={project} />
              </Box>
              <Box hidden={currentTab !== 1}>
                <LabelsTab project={project} />
              </Box>
              <Box hidden={currentTab !== 2}>
                <AnnotationsTab project={project} />
              </Box>
              <Box hidden={currentTab !== 3}>
                <WizardsTab
                  project={project}
                  // show labels tab after successful import
                  onSuccess={completeWizard}
                />
              </Box>
              <Box hidden={currentTab !== 4}>
                <TasksTab project={project} />
              </Box>
            </Paper>
          )}
        />
      </Container>
    </Layout>
  );
});

export default ProjectPage;
